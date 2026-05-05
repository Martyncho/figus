#!/usr/bin/env pwsh
# Panini Figuritas - Quick Start Script (Windows)
# This script sets up and starts the entire system

Write-Host "🎌 Panini Figuritas - Sistema de Coleccion Digital" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
$dockerInstalled = $false
try {
    docker --version 2>&1 | Out-Null
    $dockerInstalled = $true
    Write-Host "✅ Docker detectado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado. Por favor instala Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
$composeInstalled = $false
try {
    docker-compose --version 2>&1 | Out-Null
    $composeInstalled = $true
    Write-Host "✅ Docker Compose detectado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está instalado." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "📋 Creando archivo .env.local..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Archivo .env.local creado. Ajusta si necesitas cambios." -ForegroundColor Green
    Write-Host ""
}

# Start services
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "⏳ Esperando a que los servicios inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check services
Write-Host ""
Write-Host "📊 Estado de servicios:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Sistema iniciado correctamente!" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   Frontend:        http://localhost:5173"
Write-Host "   API:             http://localhost:3000"
Write-Host "   Health Check:    http://localhost:3000/health"
Write-Host "   Database:        postgres://localhost:5432/panini_db"
Write-Host "   Redis:           redis://localhost:6379"
Write-Host ""

Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Abre http://localhost:5173 en tu navegador"
Write-Host "   2. Verifica que el API está respondiendo"
Write-Host "   3. Ejecuta migraciones: docker-compose exec api npm run migrate"
Write-Host ""

Write-Host "📚 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs:         docker-compose logs -f"
Write-Host "   Ver API logs:     docker-compose logs -f api"
Write-Host "   Detener:          docker-compose down"
Write-Host "   Limpiar todo:     docker-compose down -v"
Write-Host ""

Write-Host "🎉 ¡Sistema listo para usar!" -ForegroundColor Green
