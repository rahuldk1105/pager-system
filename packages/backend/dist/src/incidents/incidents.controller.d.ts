import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, UpdateIncidentDto, AcknowledgeIncidentDto } from './dto/incident.dto';
import { Incident } from './incident.entity';
export declare class IncidentsController {
    private readonly incidentsService;
    constructor(incidentsService: IncidentsService);
    create(createIncidentDto: CreateIncidentDto): Promise<Incident>;
    findAll(status?: string, priority?: string, assignedTo?: string, createdBy?: string, limit?: string, offset?: string): Promise<{
        incidents: Incident[];
        total: number;
    }>;
    getStats(): Promise<{
        total: number;
        byStatus: Record<import("./incident.entity").IncidentStatus, number>;
        byPriority: Record<string, number>;
        activeCount: number;
    }>;
    findOne(id: string): Promise<Incident>;
    update(id: string, updateIncidentDto: UpdateIncidentDto): Promise<Incident>;
    acknowledge(id: string, acknowledgeDto: AcknowledgeIncidentDto): Promise<Incident>;
    remove(id: string): Promise<void>;
}
