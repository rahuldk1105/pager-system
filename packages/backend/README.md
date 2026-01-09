# Pager Backend API

NestJS-based backend API for the critical alerting pager system.

## Features

- **JWT Authentication** with refresh tokens and device binding
- **Role-based Authorization** (user, lead, admin)
- **User Management** with secure password hashing
- **Health Checks** for monitoring
- **Swagger Documentation** at `/api/docs`
- **PostgreSQL Database** with TypeORM
- **Migration Support** for database schema changes

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### API Documentation

Once running, visit `http://localhost:3000/api/docs` for Swagger documentation.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - List all users (admin/lead only)
- `POST /api/users` - Create user (admin only)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Health
- `GET /api/health` - Health check
- `GET /api/health/ready` - Readiness check

## Environment Variables

See `.env.example` for all required environment variables.

## Development

### Project Structure
```
src/
├── auth/           # Authentication module
├── users/          # User management module
├── health/         # Health check module
├── config/         # Configuration services
├── database/       # Migrations and database setup
├── common/         # Shared utilities and guards
└── main.ts        # Application entry point
```

### Scripts
- `npm run start:dev` - Development server with hot reload
- `npm run start:debug` - Debug mode
- `npm run build` - Production build
- `npm run lint` - Code linting
- `npm run test` - Run tests

## Security

- Passwords are hashed with bcrypt (12 salt rounds)
- JWT tokens expire in 15 minutes
- Refresh tokens are device-bound and expire in 7 days
- Rate limiting prevents brute force attacks
- Input validation and sanitization on all endpoints

## Database

### Migrations
```bash
# Create new migration
npm run migration:create -- --name=AddNewFeature

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Schema
- **users**: User accounts with roles and contact info
- **user_roles**: Many-to-many relationship between users and roles
- Indexes on frequently queried columns for performance

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting PR

## License

MIT License