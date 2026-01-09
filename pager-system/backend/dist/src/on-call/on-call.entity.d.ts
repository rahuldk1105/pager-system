export declare enum RotationType {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly"
}
export declare class OnCallSchedule {
    id: string;
    name: string;
    description?: string;
    rotationType: RotationType;
    timezone: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    assignments?: ScheduleAssignment[];
}
export declare class ScheduleAssignment {
    id: string;
    scheduleId: string;
    userId: string;
    priority: number;
    isActive: boolean;
    createdAt: Date;
    schedule?: OnCallSchedule;
}
export declare class Rotation {
    id: string;
    scheduleId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    isOverride: boolean;
    createdAt: Date;
    schedule?: OnCallSchedule;
}
