#!/bin/bash

# Photo Gallery Docker Startup Script

echo "🚀 Starting Photo Gallery..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "📦 Building and starting containers..."
echo ""

# Start based on argument
if [ "$1" == "prod" ]; then
    echo "🏭 Starting in PRODUCTION mode..."
    docker-compose up --build
elif [ "$1" == "down" ]; then
    echo "🛑 Stopping containers..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose down
else
    echo "🔧 Starting in DEVELOPMENT mode..."
    docker-compose -f docker-compose.dev.yml up --build
fi
