import { Repository } from 'typeorm';
import { Incident, IncidentStatus } from './incident.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class IncidentStateMachineService {
    private incidentRepository;
    private eventEmitter;
    private readonly logger;
    private readonly transitions;
    constructor(incidentRepository: Repository<Incident>, eventEmitter: EventEmitter2);
    transition(incidentId: string, newStatus: IncidentStatus, userId: string, notes?: string): Promise<Incident>;
    canTransition(fromStatus: IncidentStatus, toStatus: IncidentStatus): boolean;
    getAllowedTransitions(status: IncidentStatus): IncidentStatus[];
}
