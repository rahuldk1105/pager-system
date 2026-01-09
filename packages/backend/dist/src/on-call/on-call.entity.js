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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rotation = exports.ScheduleAssignment = exports.OnCallSchedule = exports.RotationType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
var RotationType;
(function (RotationType) {
    RotationType["DAILY"] = "daily";
    RotationType["WEEKLY"] = "weekly";
    RotationType["MONTHLY"] = "monthly";
})(RotationType || (exports.RotationType = RotationType = {}));
let OnCallSchedule = class OnCallSchedule {
};
exports.OnCallSchedule = OnCallSchedule;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OnCallSchedule.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OnCallSchedule.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], OnCallSchedule.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RotationType,
        default: RotationType.WEEKLY,
    }),
    __metadata("design:type", String)
], OnCallSchedule.prototype, "rotationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ default: 'UTC' }),
    __metadata("design:type", String)
], OnCallSchedule.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], OnCallSchedule.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OnCallSchedule.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OnCallSchedule.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], OnCallSchedule.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => [ScheduleAssignment] }),
    (0, typeorm_1.OneToMany)(() => ScheduleAssignment, assignment => assignment.schedule),
    __metadata("design:type", Array)
], OnCallSchedule.prototype, "assignments", void 0);
exports.OnCallSchedule = OnCallSchedule = __decorate([
    (0, typeorm_1.Entity)('on_call_schedules')
], OnCallSchedule);
let ScheduleAssignment = class ScheduleAssignment {
};
exports.ScheduleAssignment = ScheduleAssignment;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScheduleAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScheduleAssignment.prototype, "scheduleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScheduleAssignment.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], ScheduleAssignment.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ScheduleAssignment.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScheduleAssignment.prototype, "createdAt", void 0);
exports.ScheduleAssignment = ScheduleAssignment = __decorate([
    (0, typeorm_1.Entity)('schedule_assignments')
], ScheduleAssignment);
let Rotation = class Rotation {
};
exports.Rotation = Rotation;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Rotation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Rotation.prototype, "scheduleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Rotation.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Rotation.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Rotation.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Rotation.prototype, "isOverride", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Rotation.prototype, "createdAt", void 0);
exports.Rotation = Rotation = __decorate([
    (0, typeorm_1.Entity)('rotations')
], Rotation);
//# sourceMappingURL=on-call.entity.js.map