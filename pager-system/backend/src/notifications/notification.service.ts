import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CircuitBreakerService } from '../shared/circuit-breaker.service';

export interface NotificationPayload {
  type: 'incident_created' | 'incident_acknowledged' | 'incident_escalated' | 'escalation_alert';
  incidentId: string;
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private configService: ConfigService,
    private circuitBreaker: CircuitBreakerService,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('incident.created')
  async handleIncidentCreated(event: any) {
    const { incident, createdBy } = event;

    const payload: NotificationPayload = {
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
    } catch (error) {
      this.logger.error(`Failed to send incident created notification:`, error);
      // Don't throw - notification failures shouldn't break incident creation
    }
  }

  @OnEvent('incident.acknowledged')
  async handleIncidentAcknowledged(event: any) {
    const { incident, acknowledgedBy } = event;

    const payload: NotificationPayload = {
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
    } catch (error) {
      this.logger.error(`Failed to send incident acknowledged notification:`, error);
    }
  }

  @OnEvent('incident.escalated')
  async handleIncidentEscalated(event: any) {
    const { incident, level, targets } = event;

    const payload: NotificationPayload = {
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
    } catch (error) {
      this.logger.error(`Failed to send escalation notification:`, error);
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      this.logger.log(`Sending notification: ${payload.type} - ${payload.title}`);

      // TODO: Implement actual notification sending
      // This could include FCM, APNs, email, SMS, etc.

      // For now, just log the notification
      this.logger.debug('Notification payload:', payload);

    } catch (error) {
      this.logger.error(`Failed to send notification:`, error);
    }
  }

  async sendToUsers(payload: NotificationPayload, userIds: string[]): Promise<void> {
    if (!userIds || userIds.length === 0) {
      this.logger.warn('No user IDs provided for notification');
      return;
    }

    try {
      this.logger.log(`Sending notification to ${userIds.length} users: ${payload.type}`);

      // Send to each user with individual error handling
      const sendPromises = userIds.map(userId => this.sendToUser(payload, userId));

      // Wait for all notifications to complete, but don't fail if some do
      const results = await Promise.allSettled(sendPromises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(`Notification results: ${successful} successful, ${failed} failed`);

    } catch (error) {
      this.logger.error(`Failed to send notifications to users:`, error);
    }
  }

  private async sendToUser(payload: NotificationPayload, userId: string): Promise<void> {
    try {
      // TODO: Implement user-specific notification logic
      // - Look up user's device tokens
      // - Send via appropriate channels (FCM, APNs)
      // - Handle delivery confirmations

      this.logger.debug(`Would send notification to user ${userId}:`, payload);

    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
    }
  }

  // Placeholder methods for different notification channels
  async sendPushNotification(deviceToken: string, payload: NotificationPayload): Promise<void> {
    // TODO: Implement FCM/APNs sending
    this.logger.debug(`Would send push to ${deviceToken}:`, payload);
  }

  async sendEmail(email: string, payload: NotificationPayload): Promise<void> {
    // TODO: Implement email sending
    this.logger.debug(`Would send email to ${email}:`, payload);
  }

  async sendSMS(phoneNumber: string, payload: NotificationPayload): Promise<void> {
    // TODO: Implement SMS sending
    this.logger.debug(`Would send SMS to ${phoneNumber}:`, payload);
  }
}