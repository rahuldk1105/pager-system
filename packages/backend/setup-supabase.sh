# Supabase Local Development Setup
# This script initializes Supabase for local development

#!/bin/bash

set -e

echo "🔧 Setting up Supabase for local development"

# Check if supabase CLI is available via npx
if ! npx supabase --version &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install supabase --save-dev
fi

# Initialize Supabase if not already done
if [ ! -d "supabase" ]; then
    echo "📁 Initializing Supabase project..."
    npx supabase init

    # Configure Supabase for our project
    cat > supabase/config.toml << 'EOF'
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
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

echo "🚀 Starting Supabase local services..."
npx supabase start

echo ""
echo "✅ Supabase is running locally!"
echo "📊 Supabase Studio: http://localhost:54323"
echo "🔑 API URL: http://localhost:54321"
echo "🔑 Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
echo "🔑 Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"