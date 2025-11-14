#!/bin/bash

# Philand Development Setup Script

set -e

echo "🏦 Philand Development Setup"
echo "=========================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Docker is running"

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

if [ ! -f web/.env.local ]; then
    echo "📝 Creating web/.env.local file from template..."
    cp web/.env.example web/.env.local
fi

# Start development database
echo "🗄️  Starting development database..."
docker-compose -f docker-compose.dev.yml up -d database

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
if command -v cargo > /dev/null 2>&1; then
    cargo sqlx migrate run
else
    echo "⚠️  Cargo not found. Please run 'cargo sqlx migrate run' manually after installing Rust."
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "Next steps:"
echo "1. Start the backend: cargo run"
echo "2. Start the frontend: cd web && npm run dev"
echo ""
echo "URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8080"
echo "- Database: localhost:3306 (user: philand, password: philand)"
echo ""
echo "Optional tools:"
echo "- Database admin: docker-compose -f docker-compose.dev.yml --profile tools up -d adminer"
echo "- Redis cache: docker-compose -f docker-compose.dev.yml --profile cache up -d redis"