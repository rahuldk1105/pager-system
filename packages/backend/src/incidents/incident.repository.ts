import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Incident } from './incident.entity';

export interface IncidentFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  createdBy?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class IncidentRepository {
  constructor(
    @InjectRepository(Incident)
    private repository: Repository<Incident>,
  ) {}

  async create(data: Partial<Incident>): Promise<Incident> {
    const incident = this.repository.create(data);
    return this.repository.save(incident);
  }

  async findById(id: string): Promise<Incident | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy', 'acknowledgedBy', 'resolvedBy', 'closedBy'],
    });
  }

  async findAll(filters: IncidentFilters = {}): Promise<{ incidents: Incident[]; total: number }> {
    const queryBuilder = this.buildQuery(filters);

    const [incidents, total] = await queryBuilder.getManyAndCount();

    return { incidents, total };
  }

  async update(id: string, data: Partial<Incident>): Promise<Incident> {
    await this.repository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Incident with id ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Incident with id ${id} not found`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async count(filters: Partial<IncidentFilters> = {}): Promise<number> {
    const queryBuilder = this.buildQuery(filters);
    return queryBuilder.getCount();
  }

  private buildQuery(filters: Partial<IncidentFilters>): SelectQueryBuilder<Incident> {
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
}