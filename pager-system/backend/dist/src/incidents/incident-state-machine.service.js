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
var IncidentStateMachineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentStateMachineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const incident_entity_1 = require("./incident.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
let IncidentStateMachineService = IncidentStateMachineService_1 = class IncidentStateMachineService {
    constructor(incidentRepository, eventEmitter) {
        this.incidentRepository = incidentRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(IncidentStateMachineService_1.name);
        this.transitions = {
            [incident_entity_1.IncidentStatus.CREATED]: [incident_entity_1.IncidentStatus.ACKNOWLEDGED, incident_entity_1.IncidentStatus.ESCALATED],
            [incident_entity_1.IncidentStatus.ACKNOWLEDGED]: [incident_entity_1.IncidentStatus.ESCALATED, incident_entity_1.IncidentStatus.RESOLVED],
            [incident_entity_1.IncidentStatus.ESCALATED]: [incident_entity_1.IncidentStatus.ACKNOWLEDGED, incident_entity_1.IncidentStatus.RESOLVED],
            [incident_entity_1.IncidentStatus.RESOLVED]: [incident_entity_1.IncidentStatus.CLOSED],
            [incident_entity_1.IncidentStatus.CLOSED]: [],
        };
    }
    async transition(incidentId, newStatus, userId, notes) {
        const incident = await this.incidentRepository.findOne({
            where: { id: incidentId },
        });
        if (!incident) {
            throw new common_1.BadRequestException('Incident not found');
        }
        const allowedStatuses = this.transitions[incident.status];
        if (!allowedStatuses.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${incident.status} to ${newStatus}`);
        }
        const oldStatus = incident.status;
        incident.status = newStatus;
        incident.updatedAt = new Date();
        switch (newStatus) {
            case incident_entity_1.IncidentStatus.ACKNOWLEDGED:
                incident.acknowledgedAt = new Date();
                incident.acknowledgedBy = userId;
                break;
            case incident_entity_1.IncidentStatus.RESOLVED:
                incident.resolvedAt = new Date();
                incident.resolvedBy = userId;
                break;
            case incident_entity_1.IncidentStatus.CLOSED:
                incident.closedAt = new Date();
                incident.closedBy = userId;
                break;
        }
        const updatedIncident = await this.incidentRepository.save(incident);
        this.logger.log(`Incident ${incidentId} status changed: ${oldStatus} → ${newStatus} by user ${userId}`);
        this.eventEmitter.emit('incident.status.changed', {
            incident: updatedIncident,
            previousStatus: oldStatus,
            newStatus,
            changedBy: userId,
            notes,
        });
        return updatedIncident;
    }
    canTransition(fromStatus, toStatus) {
        const allowedStatuses = this.transitions[fromStatus];
        return allowedStatuses.includes(toStatus);
    }
    getAllowedTransitions(status) {
        return [...this.transitions[status]];
    }
};
exports.IncidentStateMachineService = IncidentStateMachineService;
exports.IncidentStateMachineService = IncidentStateMachineService = IncidentStateMachineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(incident_entity_1.Incident)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], IncidentStateMachineService);
//# sourceMappingURL=incident-state-machine.service.js.map