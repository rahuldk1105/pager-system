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
var OnCallService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnCallService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const on_call_entity_1 = require("./on-call.entity");
const users_service_1 = require("../users/users.service");
let OnCallService = OnCallService_1 = class OnCallService {
    constructor(scheduleRepository, assignmentRepository, rotationRepository, usersService) {
        this.scheduleRepository = scheduleRepository;
        this.assignmentRepository = assignmentRepository;
        this.rotationRepository = rotationRepository;
        this.usersService = usersService;
        this.logger = new common_1.Logger(OnCallService_1.name);
    }
    async createSchedule(name, rotationType, timezone, userId, description) {
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
    async assignUserToSchedule(scheduleId, userId, priority = 1) {
        const schedule = await this.scheduleRepository.findOne({
            where: { id: scheduleId },
        });
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        await this.usersService.findById(userId);
        const assignment = this.assignmentRepository.create({
            scheduleId,
            userId,
            priority,
        });
        const savedAssignment = await this.assignmentRepository.save(assignment);
        this.logger.log(`User ${userId} assigned to schedule ${scheduleId}`);
        return savedAssignment;
    }
    async generateRotations(scheduleId, startDate, endDate) {
        const schedule = await this.scheduleRepository.findOne({
            where: { id: scheduleId },
            relations: ['assignments'],
        });
        if (!schedule) {
            throw new common_1.NotFoundException('Schedule not found');
        }
        if (!schedule.assignments || schedule.assignments.length === 0) {
            throw new Error('Schedule has no user assignments');
        }
        const assignments = schedule.assignments
            .filter(a => a.isActive)
            .sort((a, b) => a.priority - b.priority);
        if (assignments.length === 0) {
            throw new Error('Schedule has no active user assignments');
        }
        const rotations = [];
        let currentDate = new Date(startDate);
        let assignmentIndex = 0;
        while (currentDate <= endDate) {
            const assignment = assignments[assignmentIndex % assignments.length];
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
            currentDate = new Date(endTime);
            assignmentIndex++;
        }
        const savedRotations = await this.rotationRepository.save(rotations);
        this.logger.log(`Generated ${savedRotations.length} rotations for schedule ${scheduleId}`);
        return savedRotations;
    }
    async getCurrentOnCall(scheduleId) {
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
        const user = await this.usersService.findById(currentRotation.userId);
        return {
            userId: user.id,
            userName: user.fullName,
            scheduleName: currentRotation.schedule.name,
        };
    }
    async getUpcomingRotations(scheduleId, limit = 5) {
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
    async overrideRotation(scheduleId, userId, startTime, endTime) {
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
    getRotationPeriod(rotationType) {
        switch (rotationType) {
            case on_call_entity_1.RotationType.DAILY:
                return 24 * 60 * 60 * 1000;
            case on_call_entity_1.RotationType.WEEKLY:
                return 7 * 24 * 60 * 60 * 1000;
            case on_call_entity_1.RotationType.MONTHLY:
                return 30 * 24 * 60 * 60 * 1000;
            default:
                return 7 * 24 * 60 * 60 * 1000;
        }
    }
};
exports.OnCallService = OnCallService;
exports.OnCallService = OnCallService = OnCallService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(on_call_entity_1.OnCallSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(on_call_entity_1.ScheduleAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(on_call_entity_1.Rotation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], OnCallService);
//# sourceMappingURL=on-call.service.js.map