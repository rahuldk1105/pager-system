import { IncidentPriority } from '../incident.entity';
export declare class CreateIncidentDto {
    title: string;
    description?: string;
    priority?: IncidentPriority;
    assignedTo?: string;
    escalationTimeoutMinutes?: number;
    metadata?: Record<string, any>;
}
export declare class UpdateIncidentDto {
    title?: string;
    description?: string;
    priority?: IncidentPriority;
    assignedTo?: string;
    escalationTimeoutMinutes?: number;
    metadata?: Record<string, any>;
}
export declare class AcknowledgeIncidentDto {
    notes?: string;
}
