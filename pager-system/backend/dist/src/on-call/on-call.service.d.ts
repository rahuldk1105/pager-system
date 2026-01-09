import { Repository } from 'typeorm';
import { OnCallSchedule, ScheduleAssignment, Rotation, RotationType } from './on-call.entity';
import { UsersService } from '../users/users.service';
export declare class OnCallService {
    private scheduleRepository;
    private assignmentRepository;
    private rotationRepository;
    private usersService;
    private readonly logger;
    constructor(scheduleRepository: Repository<OnCallSchedule>, assignmentRepository: Repository<ScheduleAssignment>, rotationRepository: Repository<Rotation>, usersService: UsersService);
    createSchedule(name: string, rotationType: RotationType, timezone: string, userId: string, description?: string): Promise<OnCallSchedule>;
    assignUserToSchedule(scheduleId: string, userId: string, priority?: number): Promise<ScheduleAssignment>;
    generateRotations(scheduleId: string, startDate: Date, endDate: Date): Promise<Rotation[]>;
    getCurrentOnCall(scheduleId?: string): Promise<{
        userId: string;
        userName: string;
        scheduleName: string;
    } | null>;
    getUpcomingRotations(scheduleId: string, limit?: number): Promise<Rotation[]>;
    overrideRotation(scheduleId: string, userId: string, startTime: Date, endTime: Date): Promise<Rotation>;
    private getRotationPeriod;
}
