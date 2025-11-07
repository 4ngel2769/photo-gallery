@echo off
REM Photo Gallery Docker Startup Script

echo.
echo 🚀 Starting Photo Gallery...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  No .env file found. Creating from .env.example...
    copy .env.example .env
    echo ✅ Created .env file. Please edit it with your configuration.
    echo.
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo 📦 Building and starting containers...
echo.

REM Start based on argument
if "%1"=="prod" (
    echo 🏭 Starting in PRODUCTION mode...
    docker-compose up --build
) else if "%1"=="down" (
    echo 🛑 Stopping containers...
    docker-compose -f docker-compose.dev.yml down
    docker-compose down
) else (
    echo 🔧 Starting in DEVELOPMENT mode...
    docker-compose -f docker-compose.dev.yml up --build
)
