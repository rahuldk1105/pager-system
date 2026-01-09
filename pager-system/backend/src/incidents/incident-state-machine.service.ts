import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, IncidentStatus } from './incident.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class IncidentStateMachineService {
  private readonly logger = new Logger(IncidentStateMachineService.name);

  private readonly transitions: Record<IncidentStatus, IncidentStatus[]> = {
    [IncidentStatus.CREATED]: [IncidentStatus.ACKNOWLEDGED, IncidentStatus.ESCALATED],
    [IncidentStatus.ACKNOWLEDGED]: [IncidentStatus.ESCALATED, IncidentStatus.RESOLVED],
    [IncidentStatus.ESCALATED]: [IncidentStatus.ACKNOWLEDGED, IncidentStatus.RESOLVED],
    [IncidentStatus.RESOLVED]: [IncidentStatus.CLOSED],
    [IncidentStatus.CLOSED]: [],
  };

  constructor(
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
    private eventEmitter: EventEmitter2,
  ) {}

  async transition(
    incidentId: string,
    newStatus: IncidentStatus,
    userId: string,
    notes?: string,
  ): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new BadRequestException('Incident not found');
    }

    // Validate transition
    const allowedStatuses = this.transitions[incident.status];
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${incident.status} to ${newStatus}`,
      );
    }

    const oldStatus = incident.status;
    incident.status = newStatus;
    incident.updatedAt = new Date();

    // Update status-specific fields
    switch (newStatus) {
      case IncidentStatus.ACKNOWLEDGED:
        incident.acknowledgedAt = new Date();
        incident.acknowledgedBy = userId;
        break;
      case IncidentStatus.RESOLVED:
        incident.resolvedAt = new Date();
        incident.resolvedBy = userId;
        break;
      case IncidentStatus.CLOSED:
        incident.closedAt = new Date();
        incident.closedBy = userId;
        break;
    }

    const updatedIncident = await this.incidentRepository.save(incident);

    // Log the transition
    this.logger.log(
      `Incident ${incidentId} status changed: ${oldStatus} → ${newStatus} by user ${userId}`,
    );

    // Emit event for listeners (notifications, escalation, etc.)
    this.eventEmitter.emit('incident.status.changed', {
      incident: updatedIncident,
      previousStatus: oldStatus,
      newStatus,
      changedBy: userId,
      notes,
    });

    return updatedIncident;
  }

  canTransition(fromStatus: IncidentStatus, toStatus: IncidentStatus): boolean {
    const allowedStatuses = this.transitions[fromStatus];
    return allowedStatuses.includes(toStatus);
  }

  getAllowedTransitions(status: IncidentStatus): IncidentStatus[] {
    return [...this.transitions[status]];
  }
}