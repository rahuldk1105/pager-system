import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IncidentsService } from './incidents.service';
import { IncidentRepository } from './incident.repository';
import { IncidentStateMachineService } from './incident-state-machine.service';
import { Incident, IncidentStatus } from './incident.entity';
import { CreateIncidentDto, AcknowledgeIncidentDto } from './dto/incident.dto';
import { UsersService } from '../users/users.service';
import { CacheService } from '../shared/cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '../common/exceptions';

const mockIncident: Incident = {
  id: 'test-incident-id',
  title: 'Test Incident',
  description: 'Test description',
  priority: 'high' as any,
  status: IncidentStatus.CREATED,
  assignedTo: 'test-user-id',
  createdBy: 'creator-user-id',
  escalationTimeoutMinutes: 15,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: jest.fn().mockReturnValue(true),
  canBeAcknowledged: jest.fn().mockReturnValue(true),
  canBeResolved: jest.fn().mockReturnValue(false),
  canBeClosed: jest.fn().mockReturnValue(false),
};

const mockIncidentRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUsersService = {
  findById: jest.fn(),
};

const mockCacheService = {
  generateIncidentKey: jest.fn().mockReturnValue('incident:test-incident-id'),
  getOrSet: jest.fn(),
  invalidateIncidentCache: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    },
  }),
};

const mockStateMachine = {
  transition: jest.fn(),
};

describe('IncidentsService', () => {
  let service: IncidentsService;
  let incidentRepository: IncidentRepository;
  let usersService: UsersService;
  let cacheService: CacheService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        {
          provide: IncidentRepository,
          useValue: mockIncidentRepository,
        },
        {
          provide: IncidentStateMachineService,
          useValue: mockStateMachine,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
    incidentRepository = module.get<IncidentRepository>(IncidentRepository);
    usersService = module.get<UsersService>(UsersService);
    cacheService = module.get<CacheService>(CacheService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new incident successfully', async () => {
      const createDto: CreateIncidentDto = {
        title: 'Test Incident',
        description: 'Test description',
        priority: 'high' as any,
        assignedTo: 'test-user-id',
      };

      const mockCreatedIncident = { ...mockIncident };
      mockUsersService.findById.mockResolvedValue({ id: 'test-user-id' });
      mockIncidentRepository.create.mockResolvedValue(mockCreatedIncident);

      const result = await service.create(createDto, 'creator-user-id');

      expect(result).toEqual(mockCreatedIncident);
      expect(mockUsersService.findById).toHaveBeenCalledWith('test-user-id');
      expect(mockIncidentRepository.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('incident.created', {
        incident: mockCreatedIncident,
        createdBy: 'creator-user-id',
      });
    });

    it('should throw BadRequestException if assigned user does not exist', async () => {
      const createDto: CreateIncidentDto = {
        title: 'Test Incident',
        assignedTo: 'non-existent-user',
      };

      mockUsersService.findById.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.create(createDto, 'creator-user-id')).rejects.toThrow(BadRequestException);
    });

    it('should rollback transaction on error', async () => {
      const createDto: CreateIncidentDto = {
        title: 'Test Incident',
      };

      const queryRunner = mockDataSource.createQueryRunner();
      mockIncidentRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto, 'creator-user-id')).rejects.toThrow();

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return cached incident if available', async () => {
      mockCacheService.getOrSet.mockResolvedValue(mockIncident);

      const result = await service.findById('test-incident-id');

      expect(result).toEqual(mockIncident);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        'incident:test-incident-id',
        expect.any(Function),
        { ttl: 300 }
      );
    });

    it('should fetch from repository if not cached', async () => {
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });
      mockIncidentRepository.findById.mockResolvedValue(mockIncident);

      const result = await service.findById('test-incident-id');

      expect(result).toEqual(mockIncident);
      expect(mockIncidentRepository.findById).toHaveBeenCalledWith('test-incident-id');
    });

    it('should throw NotFoundException if incident not found', async () => {
      mockCacheService.getOrSet.mockImplementation(async (key, factory) => {
        return factory();
      });
      mockIncidentRepository.findById.mockRejectedValue(new NotFoundException('Incident not found'));

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('acknowledge', () => {
    it('should acknowledge incident successfully', async () => {
      const acknowledgeDto: AcknowledgeIncidentDto = {
        notes: 'Acknowledged by user',
      };

      const acknowledgedIncident = { ...mockIncident, status: IncidentStatus.ACKNOWLEDGED };
      mockIncidentRepository.findById.mockResolvedValue(mockIncident);
      mockUsersService.findById.mockResolvedValue({
        id: 'test-user-id',
        hasRole: jest.fn().mockReturnValue(true),
      });
      mockStateMachine.transition.mockResolvedValue(acknowledgedIncident);

      const result = await service.acknowledge('test-incident-id', acknowledgeDto, 'test-user-id');

      expect(result).toEqual(acknowledgedIncident);
      expect(mockStateMachine.transition).toHaveBeenCalledWith(
        'test-incident-id',
        IncidentStatus.ACKNOWLEDGED,
        'test-user-id',
        'Acknowledged by user'
      );
      expect(mockCacheService.invalidateIncidentCache).toHaveBeenCalledWith('test-incident-id');
    });

    it('should throw BadRequestException if incident cannot be acknowledged', async () => {
      const resolvedIncident = { ...mockIncident, status: IncidentStatus.RESOLVED };
      mockIncidentRepository.findById.mockResolvedValue(resolvedIncident);
      mockUsersService.findById.mockResolvedValue({
        id: 'test-user-id',
        hasRole: jest.fn().mockReturnValue(true),
      });

      await expect(
        service.acknowledge('test-incident-id', {}, 'test-user-id')
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow acknowledgment by assigned user', async () => {
      const acknowledgeDto: AcknowledgeIncidentDto = {};
      const acknowledgedIncident = { ...mockIncident, status: IncidentStatus.ACKNOWLEDGED };

      mockIncidentRepository.findById.mockResolvedValue(mockIncident);
      mockUsersService.findById.mockResolvedValue({
        id: 'test-user-id',
        hasRole: jest.fn().mockReturnValue(false),
      });
      mockStateMachine.transition.mockResolvedValue(acknowledgedIncident);

      const result = await service.acknowledge('test-incident-id', acknowledgeDto, 'test-user-id');

      expect(result).toEqual(acknowledgedIncident);
    });
  });

  describe('getStats', () => {
    it('should return cached statistics', async () => {
      const mockStats = {
        total: 10,
        byStatus: { created: 5, acknowledged: 3, resolved: 2 },
        byPriority: { high: 6, medium: 3, low: 1 },
        activeCount: 8,
      };

      mockCacheService.getOrSet.mockResolvedValue(mockStats);

      const result = await service.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        'incidents:stats',
        expect.any(Function),
        { ttl: 30 }
      );
    });
  });
});