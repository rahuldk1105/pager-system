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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const circuit_breaker_service_1 = require("../shared/circuit-breaker.service");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(configService, circuitBreaker, eventEmitter) {
        this.configService = configService;
        this.circuitBreaker = circuitBreaker;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async handleIncidentCreated(event) {
        const { incident, createdBy } = event;
        const payload = {
            type: 'incident_created',
            incidentId: incident.id,
            title: `New Incident: ${incident.title}`,
            body: incident.description || 'A new incident has been reported',
            priority: incident.priority,
            data: {
                incidentId: incident.id,
                createdBy,
            },
        };
        try {
            await this.circuitBreaker.execute('notification-service', async () => {
                await this.sendNotification(payload);
            });
        }
        catch (error) {
            this.logger.error(`Failed to send incident created notification:`, error);
        }
    }
    async handleIncidentAcknowledged(event) {
        const { incident, acknowledgedBy } = event;
        const payload = {
            type: 'incident_acknowledged',
            incidentId: incident.id,
            title: `Incident Acknowledged: ${incident.title}`,
            body: `Incident has been acknowledged`,
            priority: 'low',
            data: {
                incidentId: incident.id,
                acknowledgedBy,
            },
        };
        try {
            await this.circuitBreaker.execute('notification-service', async () => {
                await this.sendNotification(payload);
            });
        }
        catch (error) {
            this.logger.error(`Failed to send incident acknowledged notification:`, error);
        }
    }
    async handleIncidentEscalated(event) {
        const { incident, level, targets } = event;
        const payload = {
            type: 'escalation_alert',
            incidentId: incident.id,
            title: `🚨 ESCALATION LEVEL ${level}: ${incident.title}`,
            body: `Incident requires immediate attention`,
            priority: 'critical',
            data: {
                incidentId: incident.id,
                escalationLevel: level,
                targets,
            },
        };
        try {
            await this.circuitBreaker.execute('notification-service', async () => {
                await this.sendToUsers(payload, targets);
            });
        }
        catch (error) {
            this.logger.error(`Failed to send escalation notification:`, error);
        }
    }
    async sendNotification(payload) {
        try {
            this.logger.log(`Sending notification: ${payload.type} - ${payload.title}`);
            this.logger.debug('Notification payload:', payload);
        }
        catch (error) {
            this.logger.error(`Failed to send notification:`, error);
        }
    }
    async sendToUsers(payload, userIds) {
        if (!userIds || userIds.length === 0) {
            this.logger.warn('No user IDs provided for notification');
            return;
        }
        try {
            this.logger.log(`Sending notification to ${userIds.length} users: ${payload.type}`);
            const sendPromises = userIds.map(userId => this.sendToUser(payload, userId));
            const results = await Promise.allSettled(sendPromises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            this.logger.log(`Notification results: ${successful} successful, ${failed} failed`);
        }
        catch (error) {
            this.logger.error(`Failed to send notifications to users:`, error);
        }
    }
    async sendToUser(payload, userId) {
        try {
            this.logger.debug(`Would send notification to user ${userId}:`, payload);
        }
        catch (error) {
            this.logger.error(`Failed to send notification to user ${userId}:`, error);
        }
    }
    async sendPushNotification(deviceToken, payload) {
        this.logger.debug(`Would send push to ${deviceToken}:`, payload);
    }
    async sendEmail(email, payload) {
        this.logger.debug(`Would send email to ${email}:`, payload);
    }
    async sendSMS(phoneNumber, payload) {
        this.logger.debug(`Would send SMS to ${phoneNumber}:`, payload);
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, event_emitter_1.OnEvent)('incident.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleIncidentCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('incident.acknowledged'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleIncidentAcknowledged", null);
__decorate([
    (0, event_emitter_1.OnEvent)('incident.escalated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "handleIncidentEscalated", null);
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        circuit_breaker_service_1.CircuitBreakerService,
        event_emitter_1.EventEmitter2])
], NotificationService);
//# sourceMappingURL=notification.service.js.map