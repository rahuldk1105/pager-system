import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NotFoundException } from '../common/exceptions';
import { DataSource } from 'typeorm';
import { Incident, IncidentStatus } from './incident.entity';
import { CreateIncidentDto, UpdateIncidentDto, AcknowledgeIncidentDto } from './dto/incident.dto';
import { IncidentStateMachineService } from './incident-state-machine.service';
import { IncidentRepository, IncidentFilters } from './incident.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';
import { CacheService } from '../shared/cache.service';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private incidentRepository: IncidentRepository,
    private incidentStateMachine: IncidentStateMachineService,
    private usersService: UsersService,
    private cacheService: CacheService,
    private eventEmitter: EventEmitter2,
    private dataSource: DataSource,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, userId: string): Promise<Incident> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate assigned user if provided
      if (createIncidentDto.assignedTo) {
        const assignedUser = await this.usersService.findById(createIncidentDto.assignedTo);
        if (!assignedUser) {
          throw new BadRequestException('Assigned user does not exist');
        }
      }

      // Create the incident
      const incidentData = {
        ...createIncidentDto,
        createdBy: userId,
        status: IncidentStatus.CREATED,
        escalationTimeoutMinutes: createIncidentDto.escalationTimeoutMinutes || 15,
      };

      const savedIncident = await this.incidentRepository.create(incidentData);
      await queryRunner.commitTransaction();

      this.logger.log(`Incident created: ${savedIncident.id} by user ${userId}`);

      // Emit creation event for escalation scheduling
      this.eventEmitter.emit('incident.created', {
        incident: savedIncident,
        createdBy: userId,
      });

      return savedIncident;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create incident:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options?: {
    status?: IncidentStatus;
    priority?: string;
    assignedTo?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ incidents: Incident[]; total: number }> {
    const filters: IncidentFilters = {
      status: options?.status,
      priority: options?.priority,
      assignedTo: options?.assignedTo,
      createdBy: options?.createdBy,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    };

    // For frequently accessed filters, use cache
    const cacheKey = this.cacheService.generateIncidentsListKey(filters);
    const shouldCache = !filters.assignedTo && !filters.createdBy; // Don't cache user-specific queries

    if (shouldCache) {
      return this.cacheService.getOrSet(
        cacheKey,
        () => this.incidentRepository.findAll(filters),
        { ttl: 60 }, // 1 minute for list caches
      );
    }

    return this.incidentRepository.findAll(filters);
  }

  async findById(id: string): Promise<Incident> {
    const cacheKey = this.cacheService.generateIncidentKey(id);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
          throw new NotFoundException(`Incident with ID ${id} not found`);
        }
        return incident;
      },
      { ttl: 300 }, // 5 minutes
    );
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto, userId: string): Promise<Incident> {
    const incident = await this.findById(id);

    // Validate permissions
    if (incident.createdBy !== userId) {
      // TODO: Add proper role-based permission check
      throw new BadRequestException('Only incident creator can update incident');
    }

    // Validate assigned user if being updated
    if (updateIncidentDto.assignedTo) {
      const assignedUser = await this.usersService.findById(updateIncidentDto.assignedTo);
      if (!assignedUser) {
        throw new BadRequestException('Assigned user does not exist');
      }
    }

    const updatedIncident = await this.incidentRepository.update(id, {
      ...updateIncidentDto,
      updatedAt: new Date(),
    });

    // Invalidate cache
    await this.cacheService.invalidateIncidentCache(id);

    this.logger.log(`Incident updated: ${id} by user ${userId}`);

    this.eventEmitter.emit('incident.updated', {
      incident: updatedIncident,
      updatedBy: userId,
    });

    return updatedIncident;
  }

  async acknowledge(id: string, acknowledgeDto: AcknowledgeIncidentDto, userId: string): Promise<Incident> {
    // Check if incident exists and can be acknowledged
    const incident = await this.findById(id);

    if (!incident.canBeAcknowledged()) {
      throw new BadRequestException(`Incident in status ${incident.status} cannot be acknowledged`);
    }

    // Check permissions - assigned user or leads/admins can acknowledge
    const user = await this.usersService.findById(userId);
    const canAcknowledge = incident.assignedTo === userId || user.hasRole(UserRole.LEAD) || user.hasRole(UserRole.ADMIN);

    if (!canAcknowledge) {
      throw new BadRequestException('You do not have permission to acknowledge this incident');
    }

    // Use the state machine for status transition
    const updatedIncident = await this.incidentStateMachine.transition(
      id,
      IncidentStatus.ACKNOWLEDGED,
      userId,
      acknowledgeDto.notes,
    );

    // Store acknowledgement notes in metadata if provided
    if (acknowledgeDto.notes) {
      await this.incidentRepository.update(id, {
        metadata: {
          ...updatedIncident.metadata,
          acknowledgementNotes: acknowledgeDto.notes,
        },
      });
    }

    // Invalidate cache
    await this.cacheService.invalidateIncidentCache(id);

    this.logger.log(`Incident acknowledged: ${id} by user ${userId}`);

    return updatedIncident;
  }

  async delete(id: string, userId: string): Promise<void> {
    const incident = await this.findById(id);

    // Only allow deletion of incidents in CREATED status
    if (incident.status !== IncidentStatus.CREATED) {
      throw new BadRequestException('Can only delete incidents in CREATED status');
    }

    // Validate permissions - creator or admin
    const user = await this.usersService.findById(userId);
    const canDelete = incident.createdBy === userId || user.hasRole(UserRole.ADMIN);

    if (!canDelete) {
      throw new BadRequestException('Only incident creator or admin can delete incident');
    }

    await this.incidentRepository.delete(id);

    // Invalidate cache
    await this.cacheService.invalidateIncidentCache(id);

    this.logger.log(`Incident deleted: ${id} by user ${userId}`);

    this.eventEmitter.emit('incident.deleted', {
      incidentId: id,
      deletedBy: userId,
    });
  }

  async getStats(): Promise<{
    total: number;
    byStatus: Record<IncidentStatus, number>;
    byPriority: Record<string, number>;
    activeCount: number;
  }> {
    const cacheKey = 'incidents:stats';

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const incidents = await this.incidentRepository.findAll({ limit: 10000 }); // Get all for stats

        const stats = {
          total: incidents.total,
          byStatus: {} as Record<IncidentStatus, number>,
          byPriority: {} as Record<string, number>,
          activeCount: 0,
        };

        incidents.incidents.forEach((incident) => {
          // Count by status
          stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;

          // Count by priority
          stats.byPriority[incident.priority] = (stats.byPriority[incident.priority] || 0) + 1;

          // Count active incidents
          if (incident.isActive()) {
            stats.activeCount++;
          }
        });

        return stats;
      },
      { ttl: 30 }, // Cache for 30 seconds
    );
  }
}