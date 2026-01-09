import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, UpdateIncidentDto, AcknowledgeIncidentDto } from './dto/incident.dto';
import { Incident } from './incident.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Incidents')
@ApiBearerAuth('JWT-auth')
@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.LEAD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new incident' })
  @ApiResponse({
    status: 201,
    description: 'Incident created successfully',
    type: Incident,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createIncidentDto: CreateIncidentDto,
    // TODO: Get user ID from JWT token
    // @Request() req: any
  ): Promise<Incident> {
    // Mock user ID for now - replace with actual JWT extraction
    const userId = 'user-uuid-placeholder';
    return this.incidentsService.create(createIncidentDto, userId);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.LEAD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all incidents with optional filtering' })
  @ApiQuery({ name: 'status', required: false, enum: ['created', 'acknowledged', 'escalated', 'resolved', 'closed'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'createdBy', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
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
  })
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('createdBy') createdBy?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const options = {
      status: status as any,
      priority,
      assignedTo,
      createdBy,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };

    return this.incidentsService.findAll(options);
  }

  @Get('stats')
  @Roles(UserRole.USER, UserRole.LEAD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get incident statistics' })
  @ApiResponse({
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
  })
  async getStats() {
    return this.incidentsService.getStats();
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.LEAD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get incident by ID' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({
    status: 200,
    description: 'Incident retrieved successfully',
    type: Incident,
  })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Incident> {
    return this.incidentsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.USER, UserRole.LEAD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({
    status: 200,
    description: 'Incident updated successfully',
    type: Incident,
  })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
    // TODO: Get user ID from JWT token
  ): Promise<Incident> {
    // Mock user ID for now
    const userId = 'user-uuid-placeholder';
    return this.incidentsService.update(id, updateIncidentDto, userId);
  }

  @Post(':id/acknowledge')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.LEAD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Acknowledge incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({
    status: 200,
    description: 'Incident acknowledged successfully',
    type: Incident,
  })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async acknowledge(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() acknowledgeDto: AcknowledgeIncidentDto,
    // TODO: Get user ID from JWT token
  ): Promise<Incident> {
    // Mock user ID for now
    const userId = 'user-uuid-placeholder';
    return this.incidentsService.acknowledge(id, acknowledgeDto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: 200, description: 'Incident deleted successfully' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    // Mock user ID for now
    const userId = 'admin-uuid-placeholder';
    return this.incidentsService.delete(id, userId);
  }
}