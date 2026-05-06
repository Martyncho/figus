# This file is deprecated and kept only for compatibility.
# The application now uses npm scripts for local development.
exit 0
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
