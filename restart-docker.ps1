# Professional Docker Restart Script
# Rebuilds and restarts all containers with session recovery implementation

Write-Host "🔄 Panini Figuritas - Docker Rebuild & Restart Script"  -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Set working directory
Set-Location -Path "c:\source\Pani"

# Step 1: Stop containers
Write-Host "Step 1: Stopping containers..." -ForegroundColor Yellow
docker-compose down
Write-Host "✓ Containers stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Remove old images (optional but recommended for clean build)
Write-Host "Step 2: Building new images..." -ForegroundColor Yellow
docker-compose build --no-cache api frontend
Write-Host "✓ Images built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Start containers
Write-Host "Step 3: Starting containers..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✓ Containers started" -ForegroundColor Green
Write-Host ""

# Step 4: Wait for services to be ready
Write-Host "Step 4: Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check service health
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

docker-compose ps

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "  - Frontend (Local):  http://localhost:5173" -ForegroundColor White
Write-Host "  - Frontend (Mobile): http://192.168.0.21:5173" -ForegroundColor White
Write-Host "  - API:               http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🎨 New Features:" -ForegroundColor Cyan
Write-Host "  ✓ Session persistence on page refresh (F5)" -ForegroundColor White
Write-Host "  ✓ Automatic session recovery from localStorage" -ForegroundColor White
Write-Host "  ✓ Professional loading screen during verification" -ForegroundColor White
Write-Host "  ✓ Complete state cleanup on logout" -ForegroundColor White
Write-Host "  ✓ Token validation on app mount" -ForegroundColor White
Write-Host ""
