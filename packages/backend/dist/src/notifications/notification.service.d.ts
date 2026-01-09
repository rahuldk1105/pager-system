import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CircuitBreakerService } from '../shared/circuit-breaker.service';
export interface NotificationPayload {
    type: 'incident_created' | 'incident_acknowledged' | 'incident_escalated' | 'escalation_alert';
    incidentId: string;
    title: string;
    body: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    data?: Record<string, any>;
}
export declare class NotificationService {
    private configService;
    private circuitBreaker;
    private eventEmitter;
    private readonly logger;
    constructor(configService: ConfigService, circuitBreaker: CircuitBreakerService, eventEmitter: EventEmitter2);
    handleIncidentCreated(event: any): Promise<void>;
    handleIncidentAcknowledged(event: any): Promise<void>;
    handleIncidentEscalated(event: any): Promise<void>;
    sendNotification(payload: NotificationPayload): Promise<void>;
    sendToUsers(payload: NotificationPayload, userIds: string[]): Promise<void>;
    private sendToUser;
    sendPushNotification(deviceToken: string, payload: NotificationPayload): Promise<void>;
    sendEmail(email: string, payload: NotificationPayload): Promise<void>;
    sendSMS(phoneNumber: string, payload: NotificationPayload): Promise<void>;
}
