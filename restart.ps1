#!/usr/bin/env pwsh
# Simple rebuild script without interactive prompts

Set-Location 'c:\source\Pani'

Write-Host "Restarting API and Frontend containers..." -ForegroundColor Cyan

# Restart containers - this will pick up the code changes from volumes
& docker-compose restart api frontend

Write-Host ""
Write-Host "✓ Containers restarted" -ForegroundColor Green

Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Container status:" -ForegroundColor Cyan
& docker-compose ps

Write-Host ""
Write-Host "✅ Done! Refresh the page now." -ForegroundColor Green
