# Quick Start Guide for Pager Backend Local Development
# This guide helps you set up the complete localhost development environment

## Prerequisites
- Node.js 18+
- npm or yarn
- Docker Desktop (for PostgreSQL and Redis)
- Git

## 🚀 Quick Setup (Automated)

### Option 1: Automated Setup (Recommended)
1. **Start Docker Desktop** (required for PostgreSQL and Redis)
2. **Run the complete setup script:**
   ```bash
   cd packages/backend
   ./setup-complete.sh
   ```

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
cd packages/backend
npm install
```

#### 2. Start Infrastructure Services
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Or with newer Docker Compose
docker compose up -d postgres redis
```

#### 3. Setup Supabase Locally
```bash
# Install Supabase CLI (if not already installed)
npm install supabase --save-dev

# Initialize Supabase project
npx supabase init

# Start Supabase services
npx supabase start
```

#### 4. Configure Environment
The `.env.local` file is already configured with:
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Supabase: localhost:54321
- JWT secrets for development

#### 5. Build and Start the Backend
```bash
# Build the application
npm run build

# Start in development mode
npm run start:dev
```

## 📊 Services Overview

Once everything is running, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:3000 | Main API |
| API Docs | http://localhost:3000/api/docs | Swagger documentation |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache & sessions |
| Supabase API | http://localhost:54321 | Auth & database |
| Supabase Studio | http://localhost:54323 | Database management UI |
| PgAdmin | http://localhost:5050 | Alternative DB GUI |

## 🔧 Useful Commands

```bash
# Stop all services
docker-compose down

# Stop Supabase
npx supabase stop

# Reset database
docker-compose down -v
docker-compose up -d postgres

# Run tests
npm run test

# Run linting
npm run lint
```

## 🐛 Troubleshooting

### Docker Issues
- Make sure Docker Desktop is running
- On Windows, ensure Docker is using Linux containers

### Port Conflicts
- Check if ports 3000, 5432, 6379, 54321 are available
- Use `netstat -ano` on Windows to check port usage

### Database Connection Issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

### Supabase Issues
- Stop and restart: `npx supabase stop && npx supabase start`
- Check status: `npx supabase status`

## 🔒 Security Notes

- The provided JWT secrets are for development only
- Never commit `.env.local` to version control
- Use strong passwords in production
- Rotate secrets regularly

## 🎯 Next Steps

1. **Test the API** - Visit http://localhost:3000/api/health
2. **Check API docs** - http://localhost:3000/api/docs
3. **Explore Supabase Studio** - http://localhost:54323
4. **Run tests** - `npm run test`

Happy coding! 🚀