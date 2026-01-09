import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { IncidentsService } from '../incidents/incidents.service';
import { IncidentStatus } from '../incidents/incident.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CircuitBreakerService } from '../shared/circuit-breaker.service';
import { CacheService } from '../shared/cache.service';

export interface EscalationJobData {
  incidentId: string;
  currentLevel: number;
  maxLevel: number;
  timeoutMinutes: number;
}

@Injectable()
export class EscalationService implements OnModuleInit {
  private readonly logger = new Logger(EscalationService.name);

  constructor(
    @InjectQueue('escalation') private escalationQueue: Queue,
    private incidentsService: IncidentsService,
    private circuitBreaker: CircuitBreakerService,
    private cacheService: CacheService,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    // Clean up any orphaned jobs on startup
    await this.cleanupOrphanedJobs();
  }

  async scheduleEscalation(incidentId: string, timeoutMinutes: number = 15): Promise<void> {
    return this.circuitBreaker.execute('escalation-queue', async () => {
      try {
        // Cancel any existing escalation for this incident
        await this.cancelEscalation(incidentId);

        // Validate incident exists and can be escalated
        const incident = await this.incidentsService.findById(incidentId);
        if (!incident.isActive()) {
          this.logger.log(`Incident ${incidentId} is not active, skipping escalation`);
          return;
        }

        const jobData: EscalationJobData = {
          incidentId,
          currentLevel: 1,
          maxLevel: 3, // on-call → lead → admin
          timeoutMinutes,
        };

        await this.escalationQueue.add(
          'process-escalation',
          jobData,
          {
            delay: timeoutMinutes * 60 * 1000, // Convert to milliseconds
            removeOnComplete: 10,
            removeOnFail: 5,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            jobId: `escalation-${incidentId}`, // Unique job ID to prevent duplicates
          }
        );

        this.logger.log(`Escalation scheduled for incident ${incidentId} in ${timeoutMinutes} minutes`);
      } catch (error) {
        this.logger.error(`Failed to schedule escalation for incident ${incidentId}:`, error);
        throw error;
      }
    });
  }

  async cancelEscalation(incidentId: string): Promise<void> {
    try {
      // Remove all pending escalation jobs for this incident
      const jobs = await this.escalationQueue.getJobs(['delayed', 'waiting', 'active']);
      const incidentJobs = jobs.filter(job => job.data.incidentId === incidentId);

      await Promise.all(incidentJobs.map(job => job.remove()));

      this.logger.log(`Escalation cancelled for incident ${incidentId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel escalation for incident ${incidentId}:`, error);
    }
  }

  async rescheduleEscalation(incidentId: string, newTimeoutMinutes?: number): Promise<void> {
    try {
      const incident = await this.incidentsService.findById(incidentId);
      const timeoutMinutes = newTimeoutMinutes || incident.escalationTimeoutMinutes;

      await this.scheduleEscalation(incidentId, timeoutMinutes);
      this.logger.log(`Escalation rescheduled for incident ${incidentId}`);
    } catch (error) {
      this.logger.error(`Failed to reschedule escalation for incident ${incidentId}:`, error);
    }
  }

  private async cleanupOrphanedJobs(): Promise<void> {
    try {
      // Get all active incidents
      const stats = await this.incidentsService.getStats();
      const activeIncidents = new Set();

      // This is a simplified approach - in production, you'd query the database
      // for incidents that are in active states (CREATED, ACKNOWLEDGED, ESCALATED)

      // For now, we'll clean up jobs that have no corresponding active incident
      const jobs = await this.escalationQueue.getJobs(['delayed', 'waiting']);
      const orphanedJobs = jobs.filter(job => {
        // Check if incident still exists and is active
        // This would need to be implemented with proper database queries
        return false; // Placeholder
      });

      if (orphanedJobs.length > 0) {
        await Promise.all(orphanedJobs.map(job => job.remove()));
        this.logger.log(`Cleaned up ${orphanedJobs.length} orphaned escalation jobs`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup orphaned jobs:', error);
    }
  }
}

@Processor('escalation')
export class EscalationProcessor {
  private readonly logger = new Logger(EscalationProcessor.name);

  constructor(
    private incidentsService: IncidentsService,
    private escalationService: EscalationService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Process('process-escalation')
  async handleEscalation(job: Job<EscalationJobData>): Promise<void> {
    const { incidentId, currentLevel, maxLevel, timeoutMinutes } = job.data;

    try {
      this.logger.log(`Processing escalation for incident ${incidentId}, level ${currentLevel}`);

      // Check if incident still needs escalation
      const incident = await this.incidentsService.findById(incidentId);

      if (!incident.isActive()) {
        this.logger.log(`Incident ${incidentId} is no longer active, cancelling escalation`);
        return;
      }

      // Determine escalation targets based on level
      const targets = await this.getEscalationTargets(incident, currentLevel);

      if (targets.length === 0) {
        this.logger.warn(`No escalation targets found for incident ${incidentId}, level ${currentLevel}`);
        return;
      }

      // Emit escalation event
      this.eventEmitter.emit('incident.escalated', {
        incident,
        level: currentLevel,
        targets,
        escalationJobId: job.id,
      });

      // Schedule next escalation level if not at max
      if (currentLevel < maxLevel) {
        const nextJobData: EscalationJobData = {
          incidentId,
          currentLevel: currentLevel + 1,
          maxLevel,
          timeoutMinutes,
        };

        await job.queue.add('process-escalation', nextJobData, {
          delay: timeoutMinutes * 60 * 1000,
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        });

        this.logger.log(`Next escalation level scheduled for incident ${incidentId}`);
      } else {
        this.logger.log(`Maximum escalation level reached for incident ${incidentId}`);
      }

    } catch (error) {
      this.logger.error(`Escalation processing failed for incident ${incidentId}:`, error);

      // Retry logic is handled by Bull queue configuration
      // If all retries fail, the job will be moved to failed queue
      throw error;
    }
  }

  private async getEscalationTargets(incident: any, level: number): Promise<string[]> {
    const targets: string[] = [];

    try {
      switch (level) {
        case 1: // On-call user or assigned user
          if (incident.assignedTo) {
            targets.push(incident.assignedTo);
          } else {
            // Get current on-call user
            const onCallUser = await this.getCurrentOnCallUser();
            if (onCallUser) {
              targets.push(onCallUser);
            }
          }
          break;

        case 2: // Lead users
          const leadUsers = await this.getUsersByRole('lead');
          targets.push(...leadUsers);
          break;

        case 3: // Admin users
          const adminUsers = await this.getUsersByRole('admin');
          targets.push(...adminUsers);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to get escalation targets for level ${level}:`, error);
      // Fallback: return empty array, will be logged as no targets found
    }

    return targets;
  }

  private async getCurrentOnCallUser(): Promise<string | null> {
    try {
      // This would integrate with the OnCallService
      // For now, return a placeholder or null
      return null;
    } catch (error) {
      this.logger.error('Failed to get current on-call user:', error);
      return null;
    }
  }

  private async getUsersByRole(role: string): Promise<string[]> {
    try {
      // This would query users with the specified role
      // For now, return empty array
      this.logger.warn(`getUsersByRole not implemented for role: ${role}`);
      return [];
    } catch (error) {
      this.logger.error(`Failed to get users by role ${role}:`, error);
      return [];
    }
  }
}