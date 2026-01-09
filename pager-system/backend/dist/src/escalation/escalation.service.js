"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EscalationService_1, EscalationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscalationProcessor = exports.EscalationService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const incidents_service_1 = require("../incidents/incidents.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const circuit_breaker_service_1 = require("../shared/circuit-breaker.service");
const cache_service_1 = require("../shared/cache.service");
let EscalationService = EscalationService_1 = class EscalationService {
    constructor(escalationQueue, incidentsService, circuitBreaker, cacheService, eventEmitter) {
        this.escalationQueue = escalationQueue;
        this.incidentsService = incidentsService;
        this.circuitBreaker = circuitBreaker;
        this.cacheService = cacheService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(EscalationService_1.name);
    }
    async onModuleInit() {
        await this.cleanupOrphanedJobs();
    }
    async scheduleEscalation(incidentId, timeoutMinutes = 15) {
        return this.circuitBreaker.execute('escalation-queue', async () => {
            try {
                await this.cancelEscalation(incidentId);
                const incident = await this.incidentsService.findById(incidentId);
                if (!incident.isActive()) {
                    this.logger.log(`Incident ${incidentId} is not active, skipping escalation`);
                    return;
                }
                const jobData = {
                    incidentId,
                    currentLevel: 1,
                    maxLevel: 3,
                    timeoutMinutes,
                };
                await this.escalationQueue.add('process-escalation', jobData, {
                    delay: timeoutMinutes * 60 * 1000,
                    removeOnComplete: 10,
                    removeOnFail: 5,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                    jobId: `escalation-${incidentId}`,
                });
                this.logger.log(`Escalation scheduled for incident ${incidentId} in ${timeoutMinutes} minutes`);
            }
            catch (error) {
                this.logger.error(`Failed to schedule escalation for incident ${incidentId}:`, error);
                throw error;
            }
        });
    }
    async cancelEscalation(incidentId) {
        try {
            const jobs = await this.escalationQueue.getJobs(['delayed', 'waiting', 'active']);
            const incidentJobs = jobs.filter(job => job.data.incidentId === incidentId);
            await Promise.all(incidentJobs.map(job => job.remove()));
            this.logger.log(`Escalation cancelled for incident ${incidentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to cancel escalation for incident ${incidentId}:`, error);
        }
    }
    async rescheduleEscalation(incidentId, newTimeoutMinutes) {
        try {
            const incident = await this.incidentsService.findById(incidentId);
            const timeoutMinutes = newTimeoutMinutes || incident.escalationTimeoutMinutes;
            await this.scheduleEscalation(incidentId, timeoutMinutes);
            this.logger.log(`Escalation rescheduled for incident ${incidentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to reschedule escalation for incident ${incidentId}:`, error);
        }
    }
    async cleanupOrphanedJobs() {
        try {
            const stats = await this.incidentsService.getStats();
            const activeIncidents = new Set();
            const jobs = await this.escalationQueue.getJobs(['delayed', 'waiting']);
            const orphanedJobs = jobs.filter(job => {
                return false;
            });
            if (orphanedJobs.length > 0) {
                await Promise.all(orphanedJobs.map(job => job.remove()));
                this.logger.log(`Cleaned up ${orphanedJobs.length} orphaned escalation jobs`);
            }
        }
        catch (error) {
            this.logger.error('Failed to cleanup orphaned jobs:', error);
        }
    }
};
exports.EscalationService = EscalationService;
exports.EscalationService = EscalationService = EscalationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('escalation')),
    __metadata("design:paramtypes", [Object, incidents_service_1.IncidentsService,
        circuit_breaker_service_1.CircuitBreakerService,
        cache_service_1.CacheService,
        event_emitter_1.EventEmitter2])
], EscalationService);
let EscalationProcessor = EscalationProcessor_1 = class EscalationProcessor {
    constructor(incidentsService, escalationService, eventEmitter) {
        this.incidentsService = incidentsService;
        this.escalationService = escalationService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(EscalationProcessor_1.name);
    }
    async handleEscalation(job) {
        const { incidentId, currentLevel, maxLevel, timeoutMinutes } = job.data;
        try {
            this.logger.log(`Processing escalation for incident ${incidentId}, level ${currentLevel}`);
            const incident = await this.incidentsService.findById(incidentId);
            if (!incident.isActive()) {
                this.logger.log(`Incident ${incidentId} is no longer active, cancelling escalation`);
                return;
            }
            const targets = await this.getEscalationTargets(incident, currentLevel);
            if (targets.length === 0) {
                this.logger.warn(`No escalation targets found for incident ${incidentId}, level ${currentLevel}`);
                return;
            }
            this.eventEmitter.emit('incident.escalated', {
                incident,
                level: currentLevel,
                targets,
                escalationJobId: job.id,
            });
            if (currentLevel < maxLevel) {
                const nextJobData = {
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
            }
            else {
                this.logger.log(`Maximum escalation level reached for incident ${incidentId}`);
            }
        }
        catch (error) {
            this.logger.error(`Escalation processing failed for incident ${incidentId}:`, error);
            throw error;
        }
    }
    async getEscalationTargets(incident, level) {
        const targets = [];
        try {
            switch (level) {
                case 1:
                    if (incident.assignedTo) {
                        targets.push(incident.assignedTo);
                    }
                    else {
                        const onCallUser = await this.getCurrentOnCallUser();
                        if (onCallUser) {
                            targets.push(onCallUser);
                        }
                    }
                    break;
                case 2:
                    const leadUsers = await this.getUsersByRole('lead');
                    targets.push(...leadUsers);
                    break;
                case 3:
                    const adminUsers = await this.getUsersByRole('admin');
                    targets.push(...adminUsers);
                    break;
            }
        }
        catch (error) {
            this.logger.error(`Failed to get escalation targets for level ${level}:`, error);
        }
        return targets;
    }
    async getCurrentOnCallUser() {
        try {
            return null;
        }
        catch (error) {
            this.logger.error('Failed to get current on-call user:', error);
            return null;
        }
    }
    async getUsersByRole(role) {
        try {
            this.logger.warn(`getUsersByRole not implemented for role: ${role}`);
            return [];
        }
        catch (error) {
            this.logger.error(`Failed to get users by role ${role}:`, error);
            return [];
        }
    }
};
exports.EscalationProcessor = EscalationProcessor;
__decorate([
    (0, bull_1.Process)('process-escalation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EscalationProcessor.prototype, "handleEscalation", null);
exports.EscalationProcessor = EscalationProcessor = EscalationProcessor_1 = __decorate([
    (0, bull_1.Processor)('escalation'),
    __metadata("design:paramtypes", [incidents_service_1.IncidentsService,
        EscalationService,
        event_emitter_1.EventEmitter2])
], EscalationProcessor);
//# sourceMappingURL=escalation.service.js.map