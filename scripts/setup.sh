#!/bin/bash

# ELSAS Setup Script
# This script helps you set up the ELSAS application

set -e

echo "🚀 Welcome to ELSAS Setup!"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ELSAS Demo

# Optional: Camera Integration
NEXT_PUBLIC_MOCK_CAMERA_URL=https://example.com/mock-camera-feed

# Optional: Map Integration
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# Optional: Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=false
EOF
    echo "⚠️  Please update .env.local with your Supabase credentials"
    echo "   You can get these from your Supabase project dashboard"
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run 'npm run db:push' to set up the database"
echo "3. Run 'npm run db:seed' to add sample data"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "For more information, see the README.md file" 