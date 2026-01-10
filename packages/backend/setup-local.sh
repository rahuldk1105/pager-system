#!/bin/bash

# Pager Backend Local Development Setup Script
# This script sets up a complete localhost development environment

set -e

echo "🚀 Setting up Pager Backend Local Development Environment"
echo "========================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Update docker-compose.override.yml for local development
cat > docker-compose.override.yml << 'EOF'
version: '3.8'

services:
  postgres:
    environment:
      POSTGRES_PASSWORD: secure_dev_password_123
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"
EOF

echo "✅ Created docker-compose.override.yml for local development"

# Start local services
echo "🐳 Starting PostgreSQL and Redis with Docker Compose..."
docker-compose up -d postgres redis

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL is running on localhost:5432"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

if docker-compose ps redis | grep -q "Up"; then
    echo "✅ Redis is running on localhost:6379"
else
    echo "❌ Redis failed to start"
    exit 1
fi

echo ""
echo "🎉 Local infrastructure is ready!"
echo ""
echo "Next steps:"
echo "1. Start Supabase locally: npx supabase start"
echo "2. Update .env.local SUPABASE_URL if needed"
echo "3. Run database migrations: npm run migration:run"
echo "4. Start the backend: npm run start:dev"
echo ""
echo "Services running:"
echo "- PostgreSQL: localhost:5432 (user: pager_user, db: pager_dev)"
echo "- Redis: localhost:6379"
echo "- Supabase will run on localhost:54321 when started"