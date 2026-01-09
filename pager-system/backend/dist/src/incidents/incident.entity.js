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
exports.Incident = exports.IncidentPriority = exports.IncidentStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["CREATED"] = "created";
    IncidentStatus["ACKNOWLEDGED"] = "acknowledged";
    IncidentStatus["ESCALATED"] = "escalated";
    IncidentStatus["RESOLVED"] = "resolved";
    IncidentStatus["CLOSED"] = "closed";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
var IncidentPriority;
(function (IncidentPriority) {
    IncidentPriority["LOW"] = "low";
    IncidentPriority["MEDIUM"] = "medium";
    IncidentPriority["HIGH"] = "high";
    IncidentPriority["CRITICAL"] = "critical";
})(IncidentPriority || (exports.IncidentPriority = IncidentPriority = {}));
let Incident = class Incident {
    isActive() {
        return [IncidentStatus.CREATED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.ESCALATED].includes(this.status);
    }
    canBeAcknowledged() {
        return this.status === IncidentStatus.CREATED || this.status === IncidentStatus.ESCALATED;
    }
    canBeResolved() {
        return this.status === IncidentStatus.ACKNOWLEDGED || this.status === IncidentStatus.ESCALATED;
    }
    canBeClosed() {
        return this.status === IncidentStatus.RESOLVED;
    }
};
exports.Incident = Incident;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Incident.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Incident.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: IncidentPriority,
        default: IncidentPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Incident.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: IncidentStatus,
        default: IncidentStatus.CREATED,
    }),
    __metadata("design:type", String)
], Incident.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "assignedTo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Incident.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Incident.prototype, "acknowledgedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "acknowledgedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Incident.prototype, "resolvedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "resolvedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Incident.prototype, "closedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "closedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'integer', default: 15 }),
    __metadata("design:type", Number)
], Incident.prototype, "escalationTimeoutMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, default: {} }),
    __metadata("design:type", Object)
], Incident.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Incident.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Incident.prototype, "updatedAt", void 0);
exports.Incident = Incident = __decorate([
    (0, typeorm_1.Entity)('incidents')
], Incident);
//# sourceMappingURL=incident.entity.js.map