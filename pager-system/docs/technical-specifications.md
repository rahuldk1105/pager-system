# Technical Specifications Document

## System Overview

The Pager System is a mission-critical alerting platform designed for mobile-first incident management. The system consists of a NestJS backend API, Flutter mobile application, and supporting infrastructure including PostgreSQL, Redis, and push notification services.

## Core Requirements

### Functional Requirements

#### Authentication & Authorization
- JWT-based authentication with access tokens (15min) and refresh tokens (7 days)
- Device-specific token binding for enhanced security
- Role-based access control (user, lead, admin)
- Secure password hashing with bcrypt (12 rounds minimum)
- Account lockout after 5 failed attempts (15-minute cooldown)

#### Incident Management
- Create incidents with title, description, priority, and metadata
- Incident lifecycle: created → acknowledged → escalated → resolved → closed
- Automatic assignment to on-call users based on rotation schedules
- Incident acknowledgment with optional notes
- Audit trail for all incident state changes

#### Escalation Engine
- Configurable timeout rules per priority level
- Multi-level escalation paths (on-call → lead → fallback)
- Redis-based delayed job processing with Bull queues
- Circuit breaker pattern for failure handling
- Automatic cancellation of escalations on acknowledgment

#### On-Call Rotation
- Schedule management with daily/weekly/monthly rotation patterns
- Timezone-aware scheduling with automatic conversion
- Override and vacation management
- Automatic failover to next available user
- Current on-call user detection

#### Push Notifications
- Firebase Cloud Messaging (FCM) for Android
- Apple Push Notification Service (APNs) for iOS
- Critical alerts with high-priority delivery
- Platform-specific optimizations (notification channels, critical alerts)
- Offline alert queuing with 24-hour retention
- Retry mechanisms with exponential backoff

### Non-Functional Requirements

#### Performance
- Sub-second alert delivery (<5 seconds)
- API response time <200ms for 95% of requests
- Support for 1000+ concurrent users
- Database query optimization with proper indexing

#### Reliability
- 99.9% uptime target
- Graceful degradation during service outages
- Automatic failover and recovery mechanisms
- Data persistence with point-in-time recovery

#### Security
- End-to-end encryption for sensitive data
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure secret management
- Regular security assessments

#### Scalability
- Horizontal scaling for backend services
- Database read replicas for performance
- Redis clustering for high availability
- Auto-scaling based on load metrics

## Technical Architecture

### Backend Architecture (NestJS)

#### Module Structure
```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── jwt.config.ts
├── auth/
│   ├── auth.module.ts
│   ├── controllers/
│   ├── services/
│   ├── strategies/
│   └── dto/
├── users/
│   ├── users.module.ts
│   ├── entities/
│   ├── services/
│   └── controllers/
├── incidents/
│   ├── incidents.module.ts
│   ├── entities/
│   ├── services/
│   ├── controllers/
│   └── dto/
├── on-call/
│   ├── on-call.module.ts
│   ├── entities/
│   ├── services/
│   ├── controllers/
│   └── dto/
├── escalation/
│   ├── escalation.module.ts
│   ├── entities/
│   ├── services/
│   ├── processors/
│   └── dto/
├── notifications/
│   ├── notifications.module.ts
│   ├── services/
│   ├── processors/
│   └── dto/
└── health/
    ├── health.module.ts
    └── controllers/
```

#### Core Services
- **AuthService**: JWT token management, user authentication
- **IncidentsService**: Incident CRUD, state management
- **EscalationService**: Job scheduling, timeout handling
- **OnCallService**: Rotation management, current on-call detection
- **NotificationService**: Push notification delivery, retry logic

### Mobile Architecture (Flutter)

#### Clean Architecture Structure
```
lib/
├── core/
│   ├── constants/
│   │   ├── api_endpoints.dart
│   │   ├── app_constants.dart
│   │   └── colors.dart
│   ├── errors/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   ├── api_client.dart
│   │   ├── dio_client.dart
│   │   └── network_info.dart
│   ├── theme/
│   │   ├── app_theme.dart
│   │   └── dark_theme.dart
│   └── utils/
│       ├── date_utils.dart
│       ├── validators.dart
│       └── permissions.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── providers/
│   │       ├── pages/
│   │       └── widgets/
│   ├── incidents/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── providers/
│   │       ├── pages/
│   │       └── widgets/
│   ├── notifications/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── providers/
│   │       ├── pages/
│   │       └── widgets/
│   └── settings/
│       ├── data/
│       │   ├── datasources/
│       │   ├── models/
│       │   │   └── user_settings_model.dart
│       │   └── repositories/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── providers/
│           ├── pages/
│           └── widgets/
├── shared/
│   ├── widgets/
│   │   ├── custom_button.dart
│   │   ├── loading_indicator.dart
│   │   └── error_view.dart
│   ├── models/
│   └── utils/
└── main.dart
```

#### State Management
- **Riverpod 3.0**: Compile-time safety, context-independent providers
- **Repository Pattern**: Clean separation of data and domain layers
- **UseCase Pattern**: Business logic encapsulation
- **Provider Composition**: Hierarchical provider structure for complex state

### UI/UX Design Specifications

#### Color Palette
```dart
class AppColors {
  // Critical Alert
  static const Color criticalRed = Color(0xFFDC143C);
  static const Color criticalRedLight = Color(0xFFFF6B6B);

  // Status Colors
  static const Color acknowledgedGreen = Color(0xFF28A745);
  static const Color escalatedOrange = Color(0xFFFF8C00);
  static const Color resolvedBlue = Color(0xFF007BFF);

  // Priority Colors
  static const Color highPriority = Color(0xFFFF6B35);
  static const Color mediumPriority = Color(0xFFFFC107);
  static const Color lowPriority = Color(0xFF17A2B8);

  // Neutral Colors
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceDark = Color(0xFF1E1E1E);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB3B3B3);
}
```

#### Typography Scale
```dart
class AppTypography {
  // Emergency Alert Text
  static const TextStyle emergencyTitle = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w900,
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
  );

  static const TextStyle emergencyBody = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.4,
  );

  // Regular Text
  static const TextStyle headline1 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  static const TextStyle body1 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
  );

  static const TextStyle caption = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
  );
}
```

#### Critical Alert Screen Wireframe

```
┌─────────────────────────────────────┐
│ [CRITICAL] Full-Screen Red Overlay   │
├─────────────────────────────────────┤
│                                     │
│    [LARGE SEVERITY INDICATOR]       │
│         (120px circle)              │
│         🚨 CRITICAL                 │
│                                     │
│    INCIDENT TITLE (32pt)            │
│    "Database Failure"               │
│                                     │
│    Location & Time (16pt)           │
│    📍 Data Center A • 10:30 AM      │
│                                     │
│    INCIDENT DESCRIPTION (18pt)     │
│    Primary database cluster is down │
│    affecting all customer services. │
│                                     │
│    [COUNTDOWN TIMER]                │
│    Large digits with urgency        │
│    14:59 remaining                  │
│                                     │
│    [ACK BUTTON] (Primary)           │
│    White on red, 60pt height        │
│    [ACKNOWLEDGE]                    │
│                                     │
│    [CALL LEAD] (Secondary)          │
│    Outlined, 50pt height            │
│    [CALL LEAD NOW]                  │
│                                     │
└─────────────────────────────────────┘
```

#### Incident List Screen Wireframe

```
┌─────────────────────────────────────┐
│         INCIDENTS                   │
│  ┌─────────────────────────────────┐ │
│  │ 🚨 CRITICAL                     │ │
│  │ Database Failure                │ │
│  │ 2 min ago • Unassigned          │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ ⚠️ HIGH                         │ │
│  │ API Timeout                     │ │
│  │ 15 min ago • John D.            │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 📊 MEDIUM                       │ │
│  │ Slow Response Times             │ │
│  │ 1 hour ago • Resolved           │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Navigation Structure
- **Bottom Navigation**: Incidents, On-Call, Settings
- **Deep Linking**: Support for notification taps and external links
- **Stack Navigation**: Modal presentations for critical alerts

#### Interaction Patterns
- **Pull to Refresh**: Update incident lists
- **Swipe Actions**: Quick acknowledge on incident cards
- **Haptic Feedback**: Critical alerts trigger device vibration
- **Sound Alerts**: Custom notification sounds for different priorities

### Database Design (PostgreSQL)

#### Core Tables Schema

**users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
```

**user_roles**
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'lead', 'admin')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, role)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

**incidents**
```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'acknowledged', 'escalated', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID REFERENCES users(id),
    escalation_timeout_minutes INTEGER DEFAULT 15,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_priority ON incidents(priority);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_incidents_created_by ON incidents(created_by);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_metadata ON incidents USING GIN(metadata);
```

**incident_audit_logs**
```sql
CREATE TABLE incident_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID NOT NULL REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_incident_audit_logs_incident_id ON incident_audit_logs(incident_id);
CREATE INDEX idx_incident_audit_logs_changed_by ON incident_audit_logs(changed_by);
CREATE INDEX idx_incident_audit_logs_created_at ON incident_audit_logs(created_at DESC);
```

**on_call_schedules**
```sql
CREATE TABLE on_call_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rotation_type VARCHAR(20) DEFAULT 'weekly' CHECK (rotation_type IN ('daily', 'weekly', 'monthly')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**schedule_assignments**
```sql
CREATE TABLE schedule_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES on_call_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_schedule_assignments_unique ON schedule_assignments(schedule_id, user_id);
```

**rotations**
```sql
CREATE TABLE rotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES on_call_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_override BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rotations_schedule_id ON rotations(schedule_id);
CREATE INDEX idx_rotations_user_id ON rotations(user_id);
CREATE INDEX idx_rotations_time_range ON rotations(start_time, end_time);
```

**escalation_rules**
```sql
CREATE TABLE escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    schedule_id UUID REFERENCES on_call_schedules(id),
    priority_filter VARCHAR(20)[] DEFAULT ARRAY['high', 'critical'],
    timeout_minutes INTEGER NOT NULL DEFAULT 15,
    escalation_level INTEGER NOT NULL DEFAULT 1,
    notify_users UUID[] DEFAULT ARRAY[]::UUID[],
    notify_roles VARCHAR(50)[] DEFAULT ARRAY['lead'],
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**incident_escalations**
```sql
CREATE TABLE incident_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES escalation_rules(id),
    escalation_level INTEGER NOT NULL,
    notified_users UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_incident_escalations_incident_id ON incident_escalations(incident_id);
```

#### Indexing Strategy
- **Primary Keys**: UUID-based for global uniqueness
- **Foreign Keys**: Cascading deletes for data integrity
- **Composite Indexes**: For multi-column WHERE clauses
- **Partial Indexes**: For active records only
- **GIN Indexes**: For JSONB metadata searching
- **Time-based Indexes**: For audit log queries

### Infrastructure Design

#### Container Orchestration
- **Docker**: Multi-stage builds for production images
- **Kubernetes**: Container orchestration with auto-scaling
- **Load Balancers**: Application load balancers with health checks

#### Data Storage
- **PostgreSQL**: Primary data store with read replicas
- **Redis**: Caching, session storage, and job queues
- **S3/Cloud Storage**: Static assets and backups

#### Monitoring & Logging
- **ELK Stack**: Log aggregation and analysis
- **Prometheus/Grafana**: Metrics collection and visualization
- **Sentry**: Error tracking and performance monitoring

## API Design

### API Versioning Strategy

#### URL Path Versioning
- **Current**: `/api/v1` (recommended for REST APIs)
- **Future**: `/api/v2`, `/api/v3` for breaking changes
- **Backwards Compatibility**: Maintain v1 for 2 years after v2 release

#### Header Versioning
```typescript
// Accept header versioning
GET /api/incidents
Accept: application/vnd.pager.v1+json

// Custom version header
GET /api/incidents
X-API-Version: 1
```

#### Version Implementation
```typescript
@Controller({ path: 'incidents', version: '1' })
export class IncidentsControllerV1 {
  // v1 implementation
}

@Controller({ path: 'incidents', version: '2' })
export class IncidentsControllerV2 {
  // v2 implementation with breaking changes
}
```

#### Deprecation Strategy
1. **Announce**: Deprecation notice in API responses
2. **Grace Period**: 6 months for migration
3. **Sunset**: Remove deprecated endpoints
4. **Documentation**: Maintain docs for deprecated versions

### Data Migration Procedures

#### Database Migration Strategy
```typescript
// TypeORM migration example
export class AddIncidentPriorityIndex1640000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'incidents',
      new TableIndex({
        name: 'IDX_incidents_priority',
        columnNames: ['priority'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('incidents', 'IDX_incidents_priority');
  }
}
```

#### Migration Rollback Procedures
```bash
# Rollback last migration
npm run migration:revert

# Rollback to specific migration
npm run migration:revert -- --name=AddIncidentPriorityIndex1640000000000

# Status check
npm run migration:show
```

#### Zero-Downtime Migration Strategy
1. **Pre-deployment**: Run migrations on read replica
2. **Blue-Green Deploy**: Deploy new version alongside old
3. **Traffic Shift**: Gradually move traffic to new version
4. **Monitor**: Watch for errors during migration period
5. **Cleanup**: Remove old version after successful migration

#### Data Migration Scripts
```typescript
@Injectable()
export class DataMigrationService {
  async migrateIncidentPriorities() {
    // Migrate existing incidents to new priority system
    const incidents = await this.incidentRepository.find({
      where: { priority: IsNull() }
    });

    for (const incident of incidents) {
      // Apply migration logic
      const newPriority = this.mapLegacyPriority(incident.legacyPriority);
      await this.incidentRepository.update(incident.id, {
        priority: newPriority,
        migratedAt: new Date(),
      });
    }
  }

  private mapLegacyPriority(legacy: string): IncidentPriority {
    switch (legacy) {
      case 'critical': return IncidentPriority.CRITICAL;
      case 'high': return IncidentPriority.HIGH;
      default: return IncidentPriority.MEDIUM;
    }
  }
}
```

### Circuit Breaker Implementation

#### Service-Level Circuit Breakers
```typescript
@Injectable()
export class PushNotificationCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private nextAttemptTime = 0;

  private readonly failureThreshold = 5;
  private readonly successThreshold = 2;
  private readonly timeoutMs = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new ServiceUnavailableException('Push service temporarily unavailable');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess() {
    this.failureCount = 0;
    this.successCount++;

    if (this.state === 'HALF_OPEN' && this.successCount >= this.successThreshold) {
      this.state = 'CLOSED';
      this.successCount = 0;
    }
  }

  private recordFailure() {
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.timeoutMs;
      this.failureCount = 0;
    }
  }
}
```

#### Usage in Services
```typescript
@Injectable()
export class PushService {
  constructor(private circuitBreaker: PushNotificationCircuitBreaker) {}

  async send(notification: Notification): Promise<boolean> {
    return this.circuitBreaker.execute(async () => {
      // Actual push sending logic
      return await this.fcmService.send(notification);
    });
  }
}
```

### Feature Flag System

#### Feature Flag Implementation
```typescript
@Injectable()
export class FeatureFlagService {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async isEnabled(flagName: string, userId?: string): Promise<boolean> {
    // Check environment variable
    const envFlag = this.configService.get(`FEATURE_${flagName.toUpperCase()}`);
    if (envFlag !== undefined) {
      return envFlag === 'true';
    }

    // Check user-specific override
    if (userId) {
      const userFlag = await this.redisService.get(`feature:${flagName}:user:${userId}`);
      if (userFlag !== null) {
        return userFlag === 'true';
      }
    }

    // Check percentage rollout
    const percentage = parseInt(this.configService.get(`FEATURE_${flagName.toUpperCase()}_PERCENTAGE`) || '0');
    if (percentage > 0 && userId) {
      return this.isUserInRollout(userId, percentage);
    }

    return false;
  }

  private isUserInRollout(userId: string, percentage: number): boolean {
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const userValue = parseInt(hash.substring(0, 8), 16) % 100;
    return userValue < percentage;
  }
}
```

#### Feature Flag Management
```typescript
@Controller('admin/features')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class FeatureFlagsController {
  constructor(private featureFlagService: FeatureFlagService) {}

  @Post(':flagName/enable')
  async enableFeature(@Param('flagName') flagName: string) {
    // Enable feature globally
    await this.configService.set(`FEATURE_${flagName.toUpperCase()}`, 'true');
    return { success: true };
  }

  @Post(':flagName/rollout')
  async setRolloutPercentage(
    @Param('flagName') flagName: string,
    @Body() body: { percentage: number },
  ) {
    await this.configService.set(
      `FEATURE_${flagName.toUpperCase()}_PERCENTAGE`,
      body.percentage.toString(),
    );
    return { success: true };
  }
}
```

### Cache Strategy and Invalidation

#### Multi-Level Caching
```typescript
@Injectable()
export class CacheService {
  constructor(
    private redisService: RedisService,
    private memoryCache: MemoryCache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // Check L1 cache (memory)
    let value = this.memoryCache.get(key);
    if (value) return value;

    // Check L2 cache (Redis)
    value = await this.redisService.get(key);
    if (value) {
      // Promote to L1 cache
      this.memoryCache.set(key, value, 300); // 5 minutes
      return value;
    }

    return null;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600) {
    // Set in both caches
    this.memoryCache.set(key, value, ttlSeconds);
    await this.redisService.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async invalidate(pattern: string) {
    // Invalidate L1 cache
    this.memoryCache.invalidate(pattern);

    // Invalidate L2 cache
    const keys = await this.redisService.keys(pattern);
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}
```

#### Cache Invalidation Patterns
```typescript
@Injectable()
export class IncidentCacheService {
  constructor(private cacheService: CacheService) {}

  async getIncident(id: string): Promise<Incident | null> {
    const key = `incident:${id}`;
    return this.cacheService.get(key);
  }

  async setIncident(incident: Incident) {
    const key = `incident:${incident.id}`;
    await this.cacheService.set(key, incident, 1800); // 30 minutes
  }

  async invalidateIncident(id: string) {
    const key = `incident:${id}`;
    await this.cacheService.invalidate(key);

    // Also invalidate related caches
    await this.cacheService.invalidate(`incidents:list:*`);
    await this.cacheService.invalidate(`incidents:count:*`);
  }

  async invalidateUserIncidents(userId: string) {
    await this.cacheService.invalidate(`incidents:user:${userId}:*`);
  }
}
```

### Performance Optimization

#### Database Query Optimization
- **Indexing**: Composite indexes for common query patterns
- **Query Planning**: EXPLAIN ANALYZE for slow queries
- **Connection Pooling**: Efficient connection reuse
- **Read Replicas**: Offload read queries from primary

#### API Performance
- **Response Compression**: Gzip compression for API responses
- **Pagination**: Cursor-based pagination for large datasets
- **Field Selection**: GraphQL-like field selection for mobile
- **Caching**: HTTP caching headers for static responses

#### Mobile Performance
- **Lazy Loading**: Load data on demand
- **Image Optimization**: WebP format with responsive sizing
- **Offline First**: Service worker for offline functionality
- **Bundle Splitting**: Code splitting for faster initial loads

### Authentication Endpoints

#### POST /api/v1/auth/login
Authenticate user and return tokens.

**Request:**
```json
{
  "email": "user@company.com",
  "password": "securePassword123",
  "deviceId": "unique-device-identifier",
  "deviceName": "iPhone 14 Pro",
  "pushToken": "fcm-or-apns-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["user"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "refresh-token-here",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

**Error Codes:**
- `400`: Invalid request format
- `401`: Invalid credentials
- `429`: Too many login attempts

#### POST /api/v1/auth/refresh
Refresh access token using refresh token.

**Request Headers:**
```
Authorization: Bearer {refresh_token}
```

**Request Body:**
```json
{
  "deviceId": "unique-device-identifier"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new-access-token",
      "refreshToken": "new-refresh-token",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

#### POST /api/v1/auth/logout
Logout user and invalidate device tokens.

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "deviceId": "unique-device-identifier"
}
```

### Incident Endpoints

#### GET /api/v1/incidents
List incidents with filtering and pagination.

**Query Parameters:**
- `status`: Filter by status (created, acknowledged, escalated, resolved, closed)
- `priority`: Filter by priority (low, medium, high, critical)
- `assigned_to`: Filter by assigned user ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "incidents": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "Database Connection Error",
        "description": "Primary DB cluster down",
        "priority": "critical",
        "status": "acknowledged",
        "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
        "createdBy": "550e8400-e29b-41d4-a716-446655440002",
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-01T10:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### POST /api/v1/incidents
Create a new incident.

**Request:**
```json
{
  "title": "API Response Time Degradation",
  "description": "API endpoints responding slowly",
  "priority": "high",
  "assignedTo": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "incident": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "API Response Time Degradation",
      "description": "API endpoints responding slowly",
      "priority": "high",
      "status": "created",
      "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
      "createdBy": "550e8400-e29b-41d4-a716-446655440002",
      "escalationTimeoutMinutes": 15,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  }
}
```

#### POST /api/v1/incidents/{id}/acknowledge
Acknowledge an incident.

**Request:**
```json
{
  "notes": "Investigating the database connection issue"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "incident": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "status": "acknowledged",
      "acknowledgedAt": "2024-01-01T10:15:00Z",
      "acknowledgedBy": "550e8400-e29b-41d4-a716-446655440000",
      "acknowledgementNotes": "Investigating the database connection issue"
    }
  }
}
```

### On-Call Endpoints

#### GET /api/v1/on-call/current
Get current on-call user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "currentOnCall": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "userName": "John Doe",
      "scheduleId": "550e8400-e29b-41d4-a716-446655440003",
      "scheduleName": "Primary On-Call",
      "startTime": "2024-01-01T09:00:00Z",
      "endTime": "2024-01-01T17:00:00Z"
    }
  }
}
```

### Health Endpoints

#### GET /api/v1/health
System health check.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T10:00:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "push": "healthy"
  }
}
```

### Error Response Format

All API errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "must be a valid email address"
    }
  }
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (resource state conflict)
- `429`: Too Many Requests
- `500`: Internal Server Error

### Rate Limiting
- **Authentication**: 5 requests/minute per IP, 10/hour per user
- **Incidents**: 100 requests/minute per user
- **General API**: 1000 requests/minute per user

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995260
```

## Security Design

### Authentication Flow
1. User provides email/password with device fingerprinting
2. Server validates credentials and checks account status
3. Server generates JWT access token (15min) and refresh token (7 days)
4. Refresh token is bound to specific device ID for theft prevention
5. Client stores tokens securely (Keychain/iOS, EncryptedSharedPreferences/Android)
6. Client includes access token in Authorization header for API requests
7. Client uses refresh token to obtain new tokens before expiry
8. Failed refresh attempts trigger re-authentication

### Token Security
- **Access Tokens**: 15-minute expiration, stored in memory only, never persisted
- **Refresh Tokens**: 7-day expiration, encrypted storage, device-bound
- **JWT Algorithm**: RS256 (RSA signatures) for enhanced security
- **Token Rotation**: New refresh token issued on each refresh, old invalidated
- **JTI Claims**: Unique token identifiers for revocation tracking
- **Device Binding**: Tokens linked to device ID, invalidated on device change

### Password Security
- **Hashing**: bcrypt with 12 salt rounds (work factor 4096)
- **Minimum Requirements**: 12+ characters, mixed case, numbers, symbols
- **Password History**: Prevent reuse of last 5 passwords
- **Account Lockout**: 5 failed attempts → 15-minute lockout → exponential backoff
- **Password Reset**: Time-limited tokens (15 minutes) with rate limiting

### Data Protection
- **Encryption at Rest**: AES-256-GCM for sensitive database fields
- **Encryption in Transit**: TLS 1.3 with perfect forward secrecy
- **Database Encryption**: Transparent Data Encryption (TDE)
- **Backup Encryption**: AES-256 for all backup files
- **API Security**: Input validation, SQL injection prevention, XSS protection

### API Security
- **Rate Limiting**: Token bucket algorithm (Redis-backed)
  - Authentication: 5/min per IP, 10/hour per user
  - API calls: 100/min per user, 1000/hour per user
  - Push registration: 10/hour per device
- **Request Validation**: Comprehensive input sanitization and schema validation
- **CORS Policy**: Strict origin control for mobile app domains
- **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options

### Session Management
- **Concurrent Sessions**: Maximum 5 active sessions per user
- **Session Invalidation**: Logout invalidates all user sessions
- **Idle Timeout**: 30-minute inactivity timeout
- **Suspicious Activity**: Geo-IP monitoring with alerts for unusual locations

### Audit & Compliance
- **Audit Logging**: All authentication and authorization events
- **Data Retention**: 7 years for incident data, 10 years for audit logs
- **Access Logging**: IP, User-Agent, timestamp for all API calls
- **Compliance**: SOC 2 Type II, GDPR, CCPA compliant
- **Data Minimization**: Only collect necessary user and device data

### Secrets Management
- **Environment Variables**: Development only
- **AWS Secrets Manager**: Production secrets with automatic rotation
- **Certificate Management**: ACM for TLS certificates with auto-renewal
- **Key Rotation**: JWT signing keys rotated every 30 days
- **Credential Scanning**: Automated detection of exposed secrets in code

### Threat Mitigation
- **SQL Injection**: Parameterized queries with TypeORM
- **XSS Prevention**: Input sanitization and CSP headers
- **CSRF Protection**: Stateless JWT prevents CSRF attacks
- **Brute Force**: Account lockout and CAPTCHA for suspicious activity
- **DDoS Protection**: Cloudflare WAF and rate limiting
- **Supply Chain**: Dependency scanning with Snyk and automated updates

### Incident Response
- **Security Monitoring**: Real-time threat detection with alerts
- **Automated Response**: Circuit breakers for suspicious activity
- **Forensic Logging**: Detailed logs for incident investigation
- **Communication**: Automated stakeholder notification for security events
- **Recovery Procedures**: Documented steps for security incident response

## Testing Strategy

### Backend Testing

#### Unit Testing
- **Framework**: Jest with ts-jest
- **Coverage Target**: 85% minimum (statements, branches, functions, lines)
- **Test Structure**: Arrange-Act-Assert pattern
- **Mocking**: Mock external dependencies (Redis, database, push services)
- **Coverage Tools**: Istanbul for detailed reports

**Example Test Structure:**
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Arrange
      const mockUser = { id: '1', email: 'test@example.com' };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');

      // Act
      const result = await authService.login(loginDto, deviceId);

      // Assert
      expect(result.tokens).toBeDefined();
      expect(result.user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Test invalid credentials
    });
  });
});
```

#### Integration Testing
- **Framework**: Jest with Supertest
- **Database**: Test containers with PostgreSQL
- **Redis**: Test containers with Redis
- **API Testing**: Full request/response cycle testing
- **Database Assertions**: Verify data persistence and constraints

**Test Database Setup:**
```typescript
beforeAll(async () => {
  testDb = await createTestDatabase();
  await testDb.migrate();
});

afterEach(async () => {
  await testDb.cleanup();
});

afterAll(async () => {
  await testDb.close();
});
```

#### End-to-End Testing
- **Framework**: Cypress or Playwright
- **Scope**: Critical user journeys only
- **Environment**: Staging environment with production-like data
- **Parallel Execution**: Tests run in parallel for speed

**Critical Journeys to Test:**
1. User registration and login
2. Incident creation and assignment
3. Incident acknowledgment and resolution
4. Escalation triggering and notification
5. Push notification delivery and interaction

#### Performance Testing
- **Load Testing**: k6 or Artillery
- **Scenarios**: 1000 concurrent users, 100 alerts/minute
- **Metrics**: Response time <200ms P95, error rate <1%
- **Database Load**: Connection pool utilization <80%

### Mobile Testing

#### Widget Testing
- **Framework**: Flutter test
- **Coverage**: UI component rendering and interactions
- **Mocking**: Mock repositories and services
- **Golden Tests**: Visual regression testing

**Example Widget Test:**
```dart
void main() {
  testWidgets('IncidentCard displays correctly', (WidgetTester tester) async {
    // Arrange
    final incident = Incident(
      id: '1',
      title: 'Test Incident',
      priority: Priority.high,
      status: IncidentStatus.created,
    );

    // Act
    await tester.pumpWidget(
      ProviderScope(
        overrides: [incidentProvider.overrideWithValue(incident)],
        child: MaterialApp(home: IncidentCard(incident: incident)),
      ),
    );

    // Assert
    expect(find.text('Test Incident'), findsOneWidget);
    expect(find.byIcon(Icons.warning), findsOneWidget);
  });
}
```

#### Integration Testing
- **Framework**: Flutter integration_test
- **Scope**: Feature-level testing with real services
- **Mock Services**: API calls mocked for reliability
- **Device Testing**: Firebase Test Lab for multi-device coverage

#### Device Testing
- **Platforms**: iOS (iPhone 12+), Android (API 21+)
- **Real Devices**: Firebase Test Lab or physical devices
- **Network Conditions**: Test with various connectivity scenarios
- **Battery Optimization**: Test Do Not Disturb and battery saver modes

#### Accessibility Testing
- **Tools**: Flutter accessibility scanner
- **Standards**: WCAG 2.1 AA compliance
- **Screen Readers**: VoiceOver (iOS), TalkBack (Android)
- **Color Contrast**: Minimum 4.5:1 contrast ratio
- **Touch Targets**: Minimum 44pt touch targets

### Testing Infrastructure

#### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:cov
      - uses: codecov/codecov-action@v3

  mobile-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.10.0'
      - run: flutter test --coverage
      - run: flutter pub run test_cov_badge:main
```

#### Test Data Management
- **Factories**: Generate realistic test data
- **Fixtures**: Pre-defined test datasets
- **Cleanup**: Automatic test data cleanup
- **Isolation**: Each test runs in isolation

#### Code Quality Gates
- **Linting**: ESLint (backend), Flutter analyze (mobile)
- **Type Checking**: TypeScript strict mode
- **Security Scanning**: Snyk for vulnerabilities
- **Coverage Gates**: Minimum coverage requirements

### Test Execution Strategy

#### Local Development
- **Pre-commit Hooks**: Run linting and unit tests
- **Watch Mode**: Continuous testing during development
- **Debug Mode**: Step-through debugging for complex tests

#### CI/CD Pipeline
- **Fast Feedback**: Unit tests run on every commit
- **Quality Gates**: Integration tests block deployment
- **Parallel Execution**: Tests run in parallel for speed
- **Artifact Storage**: Test results and coverage reports stored

#### Production Monitoring
- **Synthetic Tests**: Regular E2E tests against production
- **Performance Monitoring**: Real user monitoring (RUM)
- **Error Tracking**: Sentry for error aggregation
- **Alerting**: Pager alerts for test failures in production

## Deployment Strategy

### CI/CD Pipeline

#### Pipeline Stages
1. **Code Quality**: Linting, type checking, security scanning
2. **Unit Tests**: Backend and mobile unit test execution
3. **Build**: Docker images and mobile app builds
4. **Integration Tests**: API and E2E test execution
5. **Security Scan**: Container and dependency vulnerability scanning
6. **Staging Deploy**: Automated deployment to staging environment
7. **Acceptance Tests**: Manual or automated acceptance testing
8. **Production Deploy**: Blue-green deployment with canary release

#### Build Process
```dockerfile
# Multi-stage Docker build for backend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

#### Deployment Scripts
```bash
#!/bin/bash
# deploy.sh

# Build and push images
docker build -t pager-api:${TAG} .
docker tag pager-api:${TAG} ${REGISTRY}/pager-api:${TAG}
docker push ${REGISTRY}/pager-api:${TAG}

# Deploy to Kubernetes
kubectl set image deployment/pager-api pager-api=${REGISTRY}/pager-api:${TAG}
kubectl rollout status deployment/pager-api

# Health check
curl -f https://api.pagerexample.com/health || kubectl rollout undo deployment/pager-api
```

### Environment Configuration

#### Development Environment
- **Purpose**: Local development and testing
- **Configuration**: Environment variables and local databases
- **Features**: Hot reload, debug logging, mock services
- **Data**: Seed data for testing, reset on startup

#### Staging Environment
- **Purpose**: Pre-production testing and validation
- **Configuration**: Production-like infrastructure
- **Data**: Anonymized production data subset
- **Access**: Development team and select stakeholders

#### Production Environment
- **Purpose**: Live system serving end users
- **Configuration**: Full production infrastructure
- **Monitoring**: Comprehensive observability and alerting
- **Backup**: Automated backups with disaster recovery

### Blue-Green Deployment

#### Deployment Process
1. **Green Environment**: New version deployed to green environment
2. **Smoke Tests**: Automated health and functionality tests
3. **Canary Release**: 5% of traffic routed to green environment
4. **Monitoring**: Performance and error monitoring during canary
5. **Full Cutover**: 100% traffic routed to green environment
6. **Blue Environment**: Previous version kept as rollback option

#### Rollback Procedure
```bash
# Immediate rollback
kubectl rollout undo deployment/pager-api

# Gradual rollback (canary)
kubectl set image deployment/pager-api pager-api=${PREVIOUS_TAG}
kubectl rollout status deployment/pager-api

# Database rollback (if schema changes)
# Use migration rollback scripts
npm run migration:rollback
```

### Feature Flags and Dark Launches

#### Feature Flag Implementation
```typescript
@Injectable()
export class FeatureFlagService {
  constructor(private configService: ConfigService) {}

  isEnabled(flagName: string): boolean {
    return this.configService.get(`FEATURE_${flagName.toUpperCase()}`) === 'true';
  }

  async rolloutPercentage(flagName: string, percentage: number): Promise<boolean> {
    // Implement percentage-based rollout
    const userId = this.getCurrentUserId();
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const userPercentage = parseInt(hash.substring(0, 8), 16) % 100;
    return userPercentage < percentage;
  }
}
```

#### Usage Example
```typescript
if (featureFlagService.isEnabled('new-escalation-logic')) {
  // Use new escalation logic
} else {
  // Use legacy logic
}
```

### Infrastructure Scaling

#### Auto Scaling Rules
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: pager-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: pager-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Database Scaling
- **Read Replicas**: Automatic provisioning for read-heavy operations
- **Connection Pooling**: PgBouncer for efficient connection management
- **Query Optimization**: Automatic EXPLAIN plan analysis
- **Partitioning**: Time-based partitioning for audit logs and metrics

### Monitoring and Observability

#### Application Metrics
```typescript
@Injectable()
export class MetricsService {
  private readonly registry = new promClient.Registry();

  constructor() {
    // API metrics
    this.apiRequestDuration = new promClient.Histogram({
      name: 'api_request_duration_seconds',
      help: 'Duration of API requests',
      labelNames: ['method', 'endpoint', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    // Business metrics
    this.incidentCreated = new promClient.Counter({
      name: 'incidents_created_total',
      help: 'Total number of incidents created',
      labelNames: ['priority', 'source'],
    });

    this.escalationTriggered = new promClient.Counter({
      name: 'escalations_triggered_total',
      help: 'Total number of escalations triggered',
      labelNames: ['level', 'reason'],
    });
  }

  recordApiRequest(method: string, endpoint: string, status: number, duration: number) {
    this.apiRequestDuration
      .labels(method, endpoint, status.toString())
      .observe(duration);
  }

  recordIncidentCreated(priority: string, source: string) {
    this.incidentCreated.labels(priority, source).inc();
  }
}
```

#### Alerting Rules
```yaml
# Prometheus alerting rules
groups:
  - name: pager.rules
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | printf \"%.2f\" }}%"

      - alert: EscalationDelay
        expr: escalation_delay_seconds > 300
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Escalation delay detected"
          description: "Escalation delayed by {{ $value }} seconds"
```

### Backup and Recovery

#### Database Backup Strategy
```bash
#!/bin/bash
# backup.sh

# Create backup
BACKUP_FILE="/backups/pager-$(date +%Y%m%d_%H%M%S).sql"
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress and encrypt
gzip $BACKUP_FILE
openssl enc -aes-256-cbc -salt -in ${BACKUP_FILE}.gz -out ${BACKUP_FILE}.gz.enc -k $BACKUP_KEY

# Upload to S3
aws s3 cp ${BACKUP_FILE}.gz.enc s3://pager-backups/

# Cleanup old backups (keep 30 days)
aws s3api list-objects-v2 --bucket pager-backups --prefix pager- | \
  jq -r '.Contents[]?.Key' | \
  xargs -I {} aws s3 rm s3://pager-backups/{}
```

#### Recovery Procedure
1. **Stop Application**: Prevent new data writes
2. **Restore Database**: From latest backup + WAL files
3. **Validate Data**: Run integrity checks
4. **Restart Application**: With feature flags disabled
5. **Gradual Traffic**: Slowly ramp up traffic
6. **Monitor**: Watch for issues during recovery

#### Disaster Recovery
- **RTO**: 1 hour for critical services, 4 hours for full system
- **RPO**: 5 minutes data loss tolerance
- **Multi-Region**: Active-passive setup with automated failover
- **Runbooks**: Detailed procedures for different disaster scenarios

## Monitoring & Alerting

### Key Metrics
- System uptime and availability
- API response times and error rates
- Database performance and connection health
- Push notification delivery success rates
- User engagement and incident response times

### Alert Thresholds
- System availability <99.9%
- API error rate >1%
- Database connection pool >80%
- Push notification failure rate >5%
- Incident response time >5 minutes

## Compliance & Governance

### Data Retention
- Incident records: 7 years
- Audit logs: 10 years
- User data: GDPR compliant deletion
- System logs: 90 days

### Security Compliance
- SOC 2 Type II certification
- GDPR data protection compliance
- Regular penetration testing
- Security incident response procedures

## Known Limitations

### Technical Limitations
- Single-region deployment (multi-region planned)
- Maximum 5 devices per user
- 1000 alerts/minute processing limit
- 24-hour offline alert retention

### Operational Limitations
- Business hours support (24/7 planned)
- 30-day backup retention
- Quarterly security assessments
- Manual scaling for high load events