import { OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { IncidentsService } from '../incidents/incidents.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CircuitBreakerService } from '../shared/circuit-breaker.service';
import { CacheService } from '../shared/cache.service';
export interface EscalationJobData {
    incidentId: string;
    currentLevel: number;
    maxLevel: number;
    timeoutMinutes: number;
}
export declare class EscalationService implements OnModuleInit {
    private escalationQueue;
    private incidentsService;
    private circuitBreaker;
    private cacheService;
    private eventEmitter;
    private readonly logger;
    constructor(escalationQueue: Queue, incidentsService: IncidentsService, circuitBreaker: CircuitBreakerService, cacheService: CacheService, eventEmitter: EventEmitter2);
    onModuleInit(): Promise<void>;
    scheduleEscalation(incidentId: string, timeoutMinutes?: number): Promise<void>;
    cancelEscalation(incidentId: string): Promise<void>;
    rescheduleEscalation(incidentId: string, newTimeoutMinutes?: number): Promise<void>;
    private cleanupOrphanedJobs;
}
export declare class EscalationProcessor {
    private incidentsService;
    private escalationService;
    private eventEmitter;
    private readonly logger;
    constructor(incidentsService: IncidentsService, escalationService: EscalationService, eventEmitter: EventEmitter2);
    handleEscalation(job: Job<EscalationJobData>): Promise<void>;
    private getEscalationTargets;
    private getCurrentOnCallUser;
    private getUsersByRole;
}
