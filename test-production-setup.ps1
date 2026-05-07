# Quick Start - Testing Production Setup Locally (PowerShell)
# Este script prepara todo para testear la configuración de producción

Write-Host "🚀 Pani App - Production Testing Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Create necessary directories
Write-Host "[1/4] Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "config" | Out-Null
New-Item -ItemType Directory -Force -Path "config/ssl" | Out-Null
New-Item -ItemType Directory -Force -Path "backups" | Out-Null
Write-Host "✓ Directories created" -ForegroundColor Green

# 2. Create .env file
Write-Host "[2/4] Creating .env file..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "⚠ .env already exists, backing up to .env.backup" -ForegroundColor Yellow
    Copy-Item ".env" ".env.backup"
}

$envContent = @"
# Production Testing Environment
DB_NAME=pani_db
DB_USER=pani_user
DB_PASSWORD=testpass123secure
REDIS_PASSWORD=redispass123secure
JWT_SECRET=test_jwt_secret_very_long_and_random_12345
AWS_ACCESS_KEY_ID=your_aws_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=pani-stickers
CORS_ORIGIN=http://localhost
NODE_ENV=production
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✓ .env file created" -ForegroundColor Green

# 3. Check Docker
Write-Host "[3/4] Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker first." -ForegroundColor Red
    exit 1
}

# 4. Build images
Write-Host "[4/4] Building Docker images..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml build

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start services:"
Write-Host "   docker compose -f docker-compose.prod.yml up -d" -ForegroundColor Green
Write-Host ""
Write-Host "2. Check status:"
Write-Host "   docker compose -f docker-compose.prod.yml ps" -ForegroundColor Green
Write-Host ""
Write-Host "3. Test endpoints:"
Write-Host "   curl http://localhost/health" -ForegroundColor Green
Write-Host "   curl http://localhost/api/health" -ForegroundColor Green
Write-Host "   curl http://localhost/" -ForegroundColor Green
Write-Host ""
Write-Host "4. View logs:"
Write-Host "   docker compose -f docker-compose.prod.yml logs -f" -ForegroundColor Green
Write-Host ""
Write-Host "5. Stop services:"
Write-Host "   docker compose -f docker-compose.prod.yml down" -ForegroundColor Green
Write-Host ""
Write-Host "See TESTING_LOCAL.md for detailed instructions and troubleshooting"
Write-Host ""
