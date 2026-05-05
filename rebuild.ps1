#!/usr/bin/env pwsh
# Rebuild and restart containers with latest code

Set-Location 'c:\source\Pani'

Write-Host "Stopping containers..." -ForegroundColor Cyan
docker-compose down 2>&1 | Out-Null

Write-Host "Building API and Frontend without cache..." -ForegroundColor Cyan
docker-compose build --no-cache api frontend 2>&1 | Out-Null

Write-Host "Starting containers..." -ForegroundColor Cyan
docker-compose up -d 2>&1 | Out-Null

Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Containers rebuilt and started!" -ForegroundColor Green
Write-Host ""

# Verify containers are running
$status = docker-compose ps
Write-Host $status

Write-Host ""
Write-Host "✓ Ready. Refresh the browser now (Ctrl+F5)" -ForegroundColor Green
