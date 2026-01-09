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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const incidents_service_1 = require("./incidents.service");
const incident_dto_1 = require("./dto/incident.dto");
const incident_entity_1 = require("./incident.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/user.entity");
let IncidentsController = class IncidentsController {
    constructor(incidentsService) {
        this.incidentsService = incidentsService;
    }
    async create(createIncidentDto) {
        const userId = 'user-uuid-placeholder';
        return this.incidentsService.create(createIncidentDto, userId);
    }
    async findAll(status, priority, assignedTo, createdBy, limit, offset) {
        const options = {
            status: status,
            priority,
            assignedTo,
            createdBy,
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
        };
        return this.incidentsService.findAll(options);
    }
    async getStats() {
        return this.incidentsService.getStats();
    }
    async findOne(id) {
        return this.incidentsService.findById(id);
    }
    async update(id, updateIncidentDto) {
        const userId = 'user-uuid-placeholder';
        return this.incidentsService.update(id, updateIncidentDto, userId);
    }
    async acknowledge(id, acknowledgeDto) {
        const userId = 'user-uuid-placeholder';
        return this.incidentsService.acknowledge(id, acknowledgeDto, userId);
    }
    async remove(id) {
        const userId = 'admin-uuid-placeholder';
        return this.incidentsService.delete(id, userId);
    }
};
exports.IncidentsController = IncidentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.LEAD, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new incident' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Incident created successfully',
        type: incident_entity_1.Incident,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [incident_dto_1.CreateIncidentDto]),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.LEAD, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all incidents with optional filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['created', 'acknowledged', 'escalated', 'resolved', 'closed'] }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['low', 'medium', 'high', 'critical'] }),
    (0, swagger_1.ApiQuery)({ name: 'assignedTo', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'createdBy', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Incidents retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                incidents: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Incident' },
                },
                total: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('priority')),
    __param(2, (0, common_1.Query)('assignedTo')),
    __param(3, (0, common_1.Query)('createdBy')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.LEAD, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get incident statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                byStatus: { type: 'object' },
                byPriority: { type: 'object' },
                activeCount: { type: 'number' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.LEAD, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get incident by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Incident ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Incident retrieved successfully',
        type: incident_entity_1.Incident,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Incident not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.LEAD, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update incident' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Incident ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Incident updated successfully',
        type: incident_entity_1.Incident,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Incident not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, incident_dto_1.UpdateIncidentDto]),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/acknowledge'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.LEAD, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Acknowledge incident' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Incident ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Incident acknowledged successfully',
        type: incident_entity_1.Incident,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Incident not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status transition' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, incident_dto_1.AcknowledgeIncidentDto]),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "acknowledge", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete incident' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Incident ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Incident deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Incident not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncidentsController.prototype, "remove", null);
exports.IncidentsController = IncidentsController = __decorate([
    (0, swagger_1.ApiTags)('Incidents'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('incidents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [incidents_service_1.IncidentsService])
], IncidentsController);
//# sourceMappingURL=incidents.controller.js.map