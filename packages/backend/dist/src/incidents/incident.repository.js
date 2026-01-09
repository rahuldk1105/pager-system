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
exports.IncidentRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const incident_entity_1 = require("./incident.entity");
let IncidentRepository = class IncidentRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        const incident = this.repository.create(data);
        return this.repository.save(incident);
    }
    async findById(id) {
        return this.repository.findOne({
            where: { id },
            relations: ['assignedTo', 'createdBy', 'acknowledgedBy', 'resolvedBy', 'closedBy'],
        });
    }
    async findAll(filters = {}) {
        const queryBuilder = this.buildQuery(filters);
        const [incidents, total] = await queryBuilder.getManyAndCount();
        return { incidents, total };
    }
    async update(id, data) {
        await this.repository.update(id, data);
        const updated = await this.findById(id);
        if (!updated) {
            throw new Error(`Incident with id ${id} not found after update`);
        }
        return updated;
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        if (result.affected === 0) {
            throw new Error(`Incident with id ${id} not found`);
        }
    }
    async exists(id) {
        const count = await this.repository.count({ where: { id } });
        return count > 0;
    }
    async count(filters = {}) {
        const queryBuilder = this.buildQuery(filters);
        return queryBuilder.getCount();
    }
    buildQuery(filters) {
        const queryBuilder = this.repository
            .createQueryBuilder('incident')
            .leftJoinAndSelect('incident.assignedTo', 'assignedUser')
            .leftJoinAndSelect('incident.createdBy', 'createdByUser')
            .leftJoinAndSelect('incident.acknowledgedBy', 'acknowledgedByUser')
            .leftJoinAndSelect('incident.resolvedBy', 'resolvedByUser')
            .leftJoinAndSelect('incident.closedBy', 'closedByUser')
            .orderBy('incident.createdAt', 'DESC');
        if (filters.status) {
            queryBuilder.andWhere('incident.status = :status', { status: filters.status });
        }
        if (filters.priority) {
            queryBuilder.andWhere('incident.priority = :priority', { priority: filters.priority });
        }
        if (filters.assignedTo) {
            queryBuilder.andWhere('incident.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
        }
        if (filters.createdBy) {
            queryBuilder.andWhere('incident.createdBy = :createdBy', { createdBy: filters.createdBy });
        }
        if (filters.limit) {
            queryBuilder.limit(filters.limit);
        }
        if (filters.offset) {
            queryBuilder.offset(filters.offset);
        }
        return queryBuilder;
    }
};
exports.IncidentRepository = IncidentRepository;
exports.IncidentRepository = IncidentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(incident_entity_1.Incident)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IncidentRepository);
//# sourceMappingURL=incident.repository.js.map