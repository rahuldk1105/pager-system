import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { Incident, IncidentStatus } from '../../src/incidents/incident.entity';
import { User } from '../../src/users/user.entity';

describe('Incidents (e2e)', () => {
  let app: INestApplication;
  let incidentRepository: Repository<Incident>;
  let userRepository: Repository<User>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same validation pipe as in production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    incidentRepository = moduleFixture.get<Repository<Incident>>(getRepositoryToken(Incident));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    // Create a test user and get auth token
    // Note: In a real scenario, you'd set up authentication properly
    authToken = 'Bearer test-token'; // Mock token for testing
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database between tests
    await incidentRepository.clear();
    await userRepository.clear();
  });

  describe('POST /incidents', () => {
    it('should create a new incident', () => {
      return request(app.getHttpServer())
        .post('/api/incidents')
        .set('Authorization', authToken)
        .send({
          title: 'Test Incident',
          description: 'This is a test incident',
          priority: 'high',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.incident.title).toBe('Test Incident');
          expect(res.body.data.incident.priority).toBe('high');
          expect(res.body.data.incident.status).toBe('created');
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/incidents')
        .set('Authorization', authToken)
        .send({
          description: 'Missing title',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('VALIDATION_ERROR');
        });
    });

    it('should validate priority enum', () => {
      return request(app.getHttpServer())
        .post('/api/incidents')
        .set('Authorization', authToken)
        .send({
          title: 'Test Incident',
          priority: 'invalid',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('VALIDATION_ERROR');
        });
    });
  });

  describe('GET /incidents', () => {
    beforeEach(async () => {
      // Create test incidents
      await incidentRepository.save([
        {
          id: 'incident-1',
          title: 'Incident 1',
          description: 'Description 1',
          priority: 'high' as any,
          status: IncidentStatus.CREATED,
          createdBy: 'user-1',
          escalationTimeoutMinutes: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'incident-2',
          title: 'Incident 2',
          description: 'Description 2',
          priority: 'medium' as any,
          status: IncidentStatus.ACKNOWLEDGED,
          createdBy: 'user-1',
          escalationTimeoutMinutes: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });

    it('should return all incidents', () => {
      return request(app.getHttpServer())
        .get('/api/incidents')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.incidents).toHaveLength(2);
          expect(res.body.data.total).toBe(2);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/api/incidents?status=acknowledged')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.incidents).toHaveLength(1);
          expect(res.body.data.incidents[0].status).toBe('acknowledged');
        });
    });

    it('should filter by priority', () => {
      return request(app.getHttpServer())
        .get('/api/incidents?priority=high')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.incidents).toHaveLength(1);
          expect(res.body.data.incidents[0].priority).toBe('high');
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/api/incidents?limit=1&offset=1')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.incidents).toHaveLength(1);
          expect(res.body.data.total).toBe(2);
        });
    });
  });

  describe('GET /incidents/:id', () => {
    beforeEach(async () => {
      await incidentRepository.save({
        id: 'test-incident',
        title: 'Test Incident',
        description: 'Test Description',
        priority: 'high' as any,
        status: IncidentStatus.CREATED,
        createdBy: 'user-1',
        escalationTimeoutMinutes: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('should return incident by id', () => {
      return request(app.getHttpServer())
        .get('/api/incidents/test-incident')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe('Test Incident');
          expect(res.body.data.id).toBe('test-incident');
        });
    });

    it('should return 404 for non-existent incident', () => {
      return request(app.getHttpServer())
        .get('/api/incidents/non-existent')
        .set('Authorization', authToken)
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('NOT_FOUND');
        });
    });
  });

  describe('POST /incidents/:id/acknowledge', () => {
    beforeEach(async () => {
      await incidentRepository.save({
        id: 'test-incident',
        title: 'Test Incident',
        description: 'Test Description',
        priority: 'high' as any,
        status: IncidentStatus.CREATED,
        createdBy: 'user-1',
        assignedTo: 'user-2',
        escalationTimeoutMinutes: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('should acknowledge incident', () => {
      return request(app.getHttpServer())
        .post('/api/incidents/test-incident/acknowledge')
        .set('Authorization', authToken)
        .send({
          notes: 'Acknowledged by test user',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('acknowledged');
        });
    });

    it('should acknowledge incident without notes', () => {
      return request(app.getHttpServer())
        .post('/api/incidents/test-incident/acknowledge')
        .set('Authorization', authToken)
        .send({})
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('acknowledged');
        });
    });
  });

  describe('GET /incidents/stats', () => {
    beforeEach(async () => {
      await incidentRepository.save([
        {
          id: 'incident-1',
          title: 'Incident 1',
          priority: 'high' as any,
          status: IncidentStatus.CREATED,
          createdBy: 'user-1',
          escalationTimeoutMinutes: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'incident-2',
          title: 'Incident 2',
          priority: 'medium' as any,
          status: IncidentStatus.ACKNOWLEDGED,
          createdBy: 'user-1',
          escalationTimeoutMinutes: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'incident-3',
          title: 'Incident 3',
          priority: 'high' as any,
          status: IncidentStatus.RESOLVED,
          createdBy: 'user-1',
          escalationTimeoutMinutes: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });

    it('should return incident statistics', () => {
      return request(app.getHttpServer())
        .get('/api/incidents/stats')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.total).toBe(3);
          expect(res.body.data.activeCount).toBe(2); // created + acknowledged
          expect(res.body.data.byStatus.created).toBe(1);
          expect(res.body.data.byStatus.acknowledged).toBe(1);
          expect(res.body.data.byStatus.resolved).toBe(1);
          expect(res.body.data.byPriority.high).toBe(2);
          expect(res.body.data.byPriority.medium).toBe(1);
        });
    });
  });
});