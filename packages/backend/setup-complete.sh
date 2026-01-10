#!/bin/bash

# Complete Pager Backend Local Development Setup
# Sets up PostgreSQL, Redis, Supabase, and configures the backend

set -e

echo "🚀 Complete Pager Backend Local Development Setup"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Prerequisites check passed"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    print_status "Dependencies installed"
fi

# Start local infrastructure (PostgreSQL + Redis)
echo "🐳 Starting local infrastructure (PostgreSQL + Redis)..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres redis
else
    docker compose up -d postgres redis
fi

echo "⏳ Waiting for services to be ready..."
sleep 15

# Verify services are running
if docker ps | grep -q pager-postgres; then
    print_status "PostgreSQL is running"
else
    print_error "PostgreSQL failed to start"
    exit 1
fi

if docker ps | grep -q pager-redis; then
    print_status "Redis is running"
else
    print_error "Redis failed to start"
    exit 1
fi

# Setup Supabase
echo "🔧 Setting up Supabase..."

# Install Supabase CLI locally if not available
if ! npx supabase --version &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install supabase --save-dev
fi

# Initialize Supabase if not already done
if [ ! -d "supabase" ]; then
    echo "📁 Initializing Supabase project..."
    npx supabase init

    # Create custom config
    cat > supabase/config.toml << 'EOF'
project_id = "pager-backend"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
enabled = true
port = 54322
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600
enable_signup = true
enable_anonymous_sign_ins = false

[auth.email]
enable_signup = true
double_confirm_changes = false
enable_confirmations = false

[db]
port = 54322
shadow_port = 54320
major_version = 14

[realtime]
enabled = true
port = 54323

[storage]
enabled = true
port = 54324
file_size_limit = "50MiB"

[edge_functions]
enabled = true
port = 54325

[analytics]
enabled = false
port = 54327
EOF
fi

# Start Supabase
echo "🚀 Starting Supabase local services..."
npx supabase start

print_status "Supabase is running"

# Build the application
echo "🔨 Building the application..."
npm run build

print_status "Application built successfully"

echo ""
echo "🎉 Local development environment is fully set up!"
echo ""
echo "📊 Services running:"
echo "   • PostgreSQL: localhost:5432 (user: pager_user, db: pager_dev)"
echo "   • Redis: localhost:6379"
echo "   • Supabase API: http://localhost:54321"
echo "   • Supabase Studio: http://localhost:54323"
echo "   • PgAdmin: http://localhost:5050 (admin@pager.dev / admin123)"
echo ""
echo "🚀 Next steps:"
echo "   1. Start the backend: npm run start:dev"
echo "   2. API will be available at: http://localhost:3000"
echo "   3. API documentation: http://localhost:3000/api/docs"
echo ""
echo "🔧 Useful commands:"
echo "   • Stop all services: docker-compose down"
echo "   • Stop Supabase: npx supabase stop"
echo "   • Reset database: docker-compose down -v && docker-compose up -d postgres"
echo ""
print_warning "Remember to never commit .env.local to version control!"