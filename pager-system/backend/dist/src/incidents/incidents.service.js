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
var IncidentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const exceptions_1 = require("../common/exceptions");
const typeorm_1 = require("typeorm");
const incident_entity_1 = require("./incident.entity");
const incident_state_machine_service_1 = require("./incident-state-machine.service");
const incident_repository_1 = require("./incident.repository");
const event_emitter_1 = require("@nestjs/event-emitter");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/user.entity");
const cache_service_1 = require("../shared/cache.service");
let IncidentsService = IncidentsService_1 = class IncidentsService {
    constructor(incidentRepository, incidentStateMachine, usersService, cacheService, eventEmitter, dataSource) {
        this.incidentRepository = incidentRepository;
        this.incidentStateMachine = incidentStateMachine;
        this.usersService = usersService;
        this.cacheService = cacheService;
        this.eventEmitter = eventEmitter;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(IncidentsService_1.name);
    }
    async create(createIncidentDto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (createIncidentDto.assignedTo) {
                const assignedUser = await this.usersService.findById(createIncidentDto.assignedTo);
                if (!assignedUser) {
                    throw new common_1.BadRequestException('Assigned user does not exist');
                }
            }
            const incidentData = Object.assign(Object.assign({}, createIncidentDto), { createdBy: userId, status: incident_entity_1.IncidentStatus.CREATED, escalationTimeoutMinutes: createIncidentDto.escalationTimeoutMinutes || 15 });
            const savedIncident = await this.incidentRepository.create(incidentData);
            await queryRunner.commitTransaction();
            this.logger.log(`Incident created: ${savedIncident.id} by user ${userId}`);
            this.eventEmitter.emit('incident.created', {
                incident: savedIncident,
                createdBy: userId,
            });
            return savedIncident;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to create incident:`, error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(options) {
        const filters = {
            status: options === null || options === void 0 ? void 0 : options.status,
            priority: options === null || options === void 0 ? void 0 : options.priority,
            assignedTo: options === null || options === void 0 ? void 0 : options.assignedTo,
            createdBy: options === null || options === void 0 ? void 0 : options.createdBy,
            limit: (options === null || options === void 0 ? void 0 : options.limit) || 20,
            offset: (options === null || options === void 0 ? void 0 : options.offset) || 0,
        };
        const cacheKey = this.cacheService.generateIncidentsListKey(filters);
        const shouldCache = !filters.assignedTo && !filters.createdBy;
        if (shouldCache) {
            return this.cacheService.getOrSet(cacheKey, () => this.incidentRepository.findAll(filters), { ttl: 60 });
        }
        return this.incidentRepository.findAll(filters);
    }
    async findById(id) {
        const cacheKey = this.cacheService.generateIncidentKey(id);
        return this.cacheService.getOrSet(cacheKey, async () => {
            const incident = await this.incidentRepository.findById(id);
            if (!incident) {
                throw new exceptions_1.NotFoundException(`Incident with ID ${id} not found`);
            }
            return incident;
        }, { ttl: 300 });
    }
    async update(id, updateIncidentDto, userId) {
        const incident = await this.findById(id);
        if (incident.createdBy !== userId) {
            throw new common_1.BadRequestException('Only incident creator can update incident');
        }
        if (updateIncidentDto.assignedTo) {
            const assignedUser = await this.usersService.findById(updateIncidentDto.assignedTo);
            if (!assignedUser) {
                throw new common_1.BadRequestException('Assigned user does not exist');
            }
        }
        const updatedIncident = await this.incidentRepository.update(id, Object.assign(Object.assign({}, updateIncidentDto), { updatedAt: new Date() }));
        await this.cacheService.invalidateIncidentCache(id);
        this.logger.log(`Incident updated: ${id} by user ${userId}`);
        this.eventEmitter.emit('incident.updated', {
            incident: updatedIncident,
            updatedBy: userId,
        });
        return updatedIncident;
    }
    async acknowledge(id, acknowledgeDto, userId) {
        const incident = await this.findById(id);
        if (!incident.canBeAcknowledged()) {
            throw new common_1.BadRequestException(`Incident in status ${incident.status} cannot be acknowledged`);
        }
        const user = await this.usersService.findById(userId);
        const canAcknowledge = incident.assignedTo === userId || user.hasRole(user_entity_1.UserRole.LEAD) || user.hasRole(user_entity_1.UserRole.ADMIN);
        if (!canAcknowledge) {
            throw new common_1.BadRequestException('You do not have permission to acknowledge this incident');
        }
        const updatedIncident = await this.incidentStateMachine.transition(id, incident_entity_1.IncidentStatus.ACKNOWLEDGED, userId, acknowledgeDto.notes);
        if (acknowledgeDto.notes) {
            await this.incidentRepository.update(id, {
                metadata: Object.assign(Object.assign({}, updatedIncident.metadata), { acknowledgementNotes: acknowledgeDto.notes }),
            });
        }
        await this.cacheService.invalidateIncidentCache(id);
        this.logger.log(`Incident acknowledged: ${id} by user ${userId}`);
        return updatedIncident;
    }
    async delete(id, userId) {
        const incident = await this.findById(id);
        if (incident.status !== incident_entity_1.IncidentStatus.CREATED) {
            throw new common_1.BadRequestException('Can only delete incidents in CREATED status');
        }
        const user = await this.usersService.findById(userId);
        const canDelete = incident.createdBy === userId || user.hasRole(user_entity_1.UserRole.ADMIN);
        if (!canDelete) {
            throw new common_1.BadRequestException('Only incident creator or admin can delete incident');
        }
        await this.incidentRepository.delete(id);
        await this.cacheService.invalidateIncidentCache(id);
        this.logger.log(`Incident deleted: ${id} by user ${userId}`);
        this.eventEmitter.emit('incident.deleted', {
            incidentId: id,
            deletedBy: userId,
        });
    }
    async getStats() {
        const cacheKey = 'incidents:stats';
        return this.cacheService.getOrSet(cacheKey, async () => {
            const incidents = await this.incidentRepository.findAll({ limit: 10000 });
            const stats = {
                total: incidents.total,
                byStatus: {},
                byPriority: {},
                activeCount: 0,
            };
            incidents.incidents.forEach((incident) => {
                stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;
                stats.byPriority[incident.priority] = (stats.byPriority[incident.priority] || 0) + 1;
                if (incident.isActive()) {
                    stats.activeCount++;
                }
            });
            return stats;
        }, { ttl: 30 });
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = IncidentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [incident_repository_1.IncidentRepository,
        incident_state_machine_service_1.IncidentStateMachineService,
        users_service_1.UsersService,
        cache_service_1.CacheService,
        event_emitter_1.EventEmitter2,
        typeorm_1.DataSource])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map