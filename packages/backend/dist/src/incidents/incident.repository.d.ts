import { Repository } from 'typeorm';
import { Incident } from './incident.entity';
export interface IncidentFilters {
    status?: string;
    priority?: string;
    assignedTo?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
}
export declare class IncidentRepository {
    private repository;
    constructor(repository: Repository<Incident>);
    create(data: Partial<Incident>): Promise<Incident>;
    findById(id: string): Promise<Incident | null>;
    findAll(filters?: IncidentFilters): Promise<{
        incidents: Incident[];
        total: number;
    }>;
    update(id: string, data: Partial<Incident>): Promise<Incident>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    count(filters?: Partial<IncidentFilters>): Promise<number>;
    private buildQuery;
}
