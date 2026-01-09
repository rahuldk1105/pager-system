import { DataSource } from 'typeorm';
import { Incident, IncidentStatus } from './incident.entity';
import { CreateIncidentDto, UpdateIncidentDto, AcknowledgeIncidentDto } from './dto/incident.dto';
import { IncidentStateMachineService } from './incident-state-machine.service';
import { IncidentRepository } from './incident.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';
import { CacheService } from '../shared/cache.service';
export declare class IncidentsService {
    private incidentRepository;
    private incidentStateMachine;
    private usersService;
    private cacheService;
    private eventEmitter;
    private dataSource;
    private readonly logger;
    constructor(incidentRepository: IncidentRepository, incidentStateMachine: IncidentStateMachineService, usersService: UsersService, cacheService: CacheService, eventEmitter: EventEmitter2, dataSource: DataSource);
    create(createIncidentDto: CreateIncidentDto, userId: string): Promise<Incident>;
    findAll(options?: {
        status?: IncidentStatus;
        priority?: string;
        assignedTo?: string;
        createdBy?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        incidents: Incident[];
        total: number;
    }>;
    findById(id: string): Promise<Incident>;
    update(id: string, updateIncidentDto: UpdateIncidentDto, userId: string): Promise<Incident>;
    acknowledge(id: string, acknowledgeDto: AcknowledgeIncidentDto, userId: string): Promise<Incident>;
    delete(id: string, userId: string): Promise<void>;
    getStats(): Promise<{
        total: number;
        byStatus: Record<IncidentStatus, number>;
        byPriority: Record<string, number>;
        activeCount: number;
    }>;
}
