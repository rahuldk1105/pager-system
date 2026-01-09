export declare enum IncidentStatus {
    CREATED = "created",
    ACKNOWLEDGED = "acknowledged",
    ESCALATED = "escalated",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare enum IncidentPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class Incident {
    id: string;
    title: string;
    description?: string;
    priority: IncidentPriority;
    status: IncidentStatus;
    assignedTo?: string;
    createdBy: string;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
    closedAt?: Date;
    closedBy?: string;
    escalationTimeoutMinutes: number;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    isActive(): boolean;
    canBeAcknowledged(): boolean;
    canBeResolved(): boolean;
    canBeClosed(): boolean;
}
