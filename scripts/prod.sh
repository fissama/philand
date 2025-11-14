#!/bin/bash

# Philand Production Deployment Script

set -e

echo "🏦 Philand Production Deployment"
echo "==============================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if environment files exist
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

# Set build date
export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "✅ Environment validated"

# Build and start all services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check database
if docker-compose exec -T database mysqladmin ping -h localhost --silent; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
    exit 1
fi

# Check backend
if curl -f http://localhost:8080/healthz > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo ""
echo "🎉 Production deployment successful!"
echo ""
echo "Services:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8080"
echo "- Nginx (if enabled): http://localhost:80"
echo ""
echo "Management commands:"
echo "- View logs: docker-compose logs -f [service]"
echo "- Stop services: docker-compose down"
echo "- Update services: docker-compose pull && docker-compose up -d"