import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OnCallSchedule, ScheduleAssignment, Rotation, RotationType } from './on-call.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class OnCallService {
  private readonly logger = new Logger(OnCallService.name);

  constructor(
    @InjectRepository(OnCallSchedule)
    private scheduleRepository: Repository<OnCallSchedule>,
    @InjectRepository(ScheduleAssignment)
    private assignmentRepository: Repository<ScheduleAssignment>,
    @InjectRepository(Rotation)
    private rotationRepository: Repository<Rotation>,
    private usersService: UsersService,
  ) {}

  async createSchedule(
    name: string,
    rotationType: RotationType,
    timezone: string,
    userId: string,
    description?: string,
  ): Promise<OnCallSchedule> {
    const schedule = this.scheduleRepository.create({
      name,
      description,
      rotationType,
      timezone,
      createdBy: userId,
    });

    const savedSchedule = await this.scheduleRepository.save(schedule);
    this.logger.log(`On-call schedule created: ${savedSchedule.id} by user ${userId}`);

    return savedSchedule;
  }

  async assignUserToSchedule(
    scheduleId: string,
    userId: string,
    priority: number = 1,
  ): Promise<ScheduleAssignment> {
    // Verify schedule exists
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Verify user exists
    await this.usersService.findById(userId);

    // Create assignment
    const assignment = this.assignmentRepository.create({
      scheduleId,
      userId,
      priority,
    });

    const savedAssignment = await this.assignmentRepository.save(assignment);
    this.logger.log(`User ${userId} assigned to schedule ${scheduleId}`);

    return savedAssignment;
  }

  async generateRotations(
    scheduleId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Rotation[]> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['assignments'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (!schedule.assignments || schedule.assignments.length === 0) {
      throw new Error('Schedule has no user assignments');
    }

    // Sort assignments by priority
    const assignments = schedule.assignments
      .filter(a => a.isActive)
      .sort((a, b) => a.priority - b.priority);

    if (assignments.length === 0) {
      throw new Error('Schedule has no active user assignments');
    }

    const rotations: Rotation[] = [];
    let currentDate = new Date(startDate);
    let assignmentIndex = 0;

    while (currentDate <= endDate) {
      const assignment = assignments[assignmentIndex % assignments.length];

      // Calculate rotation period based on type
      const rotationPeriod = this.getRotationPeriod(schedule.rotationType);

      const startTime = new Date(currentDate);
      const endTime = new Date(currentDate.getTime() + rotationPeriod);

      const rotation = this.rotationRepository.create({
        scheduleId,
        userId: assignment.userId,
        startTime,
        endTime,
      });

      rotations.push(rotation);

      // Move to next rotation period
      currentDate = new Date(endTime);
      assignmentIndex++;
    }

    const savedRotations = await this.rotationRepository.save(rotations);
    this.logger.log(`Generated ${savedRotations.length} rotations for schedule ${scheduleId}`);

    return savedRotations;
  }

  async getCurrentOnCall(scheduleId?: string): Promise<{ userId: string; userName: string; scheduleName: string } | null> {
    const now = new Date();

    let query = this.rotationRepository
      .createQueryBuilder('rotation')
      .leftJoinAndSelect('rotation.schedule', 'schedule')
      .where('rotation.startTime <= :now', { now })
      .andWhere('rotation.endTime > :now', { now });

    if (scheduleId) {
      query = query.andWhere('rotation.scheduleId = :scheduleId', { scheduleId });
    }

    const currentRotation = await query
      .orderBy('rotation.startTime', 'DESC')
      .getOne();

    if (!currentRotation) {
      return null;
    }

    // Get user details
    const user = await this.usersService.findById(currentRotation.userId);

    return {
      userId: user.id,
      userName: user.fullName,
      scheduleName: currentRotation.schedule.name,
    };
  }

  async getUpcomingRotations(scheduleId: string, limit: number = 5): Promise<Rotation[]> {
    const now = new Date();

    return this.rotationRepository
      .createQueryBuilder('rotation')
      .leftJoinAndSelect('rotation.schedule', 'schedule')
      .where('rotation.scheduleId = :scheduleId', { scheduleId })
      .andWhere('rotation.startTime > :now', { now })
      .orderBy('rotation.startTime', 'ASC')
      .limit(limit)
      .getMany();
  }

  async overrideRotation(
    scheduleId: string,
    userId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Rotation> {
    // Create override rotation
    const override = this.rotationRepository.create({
      scheduleId,
      userId,
      startTime,
      endTime,
      isOverride: true,
    });

    const savedOverride = await this.rotationRepository.save(override);
    this.logger.log(`Rotation override created for schedule ${scheduleId}, user ${userId}`);

    return savedOverride;
  }

  private getRotationPeriod(rotationType: RotationType): number {
    switch (rotationType) {
      case RotationType.DAILY:
        return 24 * 60 * 60 * 1000; // 24 hours
      case RotationType.WEEKLY:
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case RotationType.MONTHLY:
        return 30 * 24 * 60 * 60 * 1000; // 30 days (approximate)
      default:
        return 7 * 24 * 60 * 60 * 1000; // Default to weekly
    }
  }
}