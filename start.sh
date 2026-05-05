#!/bin/bash

# Panini Figuritas - Quick Start Script
# This script sets up and starts the entire system

set -e  # Exit on error

echo "🎌 Panini Figuritas - Sistema de Colección Digital"
echo "=================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose."
    exit 1
fi

echo "✅ Docker y Docker Compose detectados"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📋 Creando archivo .env.local..."
    cp .env.example .env.local
    echo "✅ Archivo .env.local creado. Ajusta si necesitas cambios."
    echo ""
fi

# Start services
echo "🚀 Iniciando servicios..."
docker-compose up -d

echo ""
echo "⏳ Esperando a que los servicios inicien..."
sleep 5

# Check services
echo ""
echo "📊 Estado de servicios:"
docker-compose ps

echo ""
echo "✅ Sistema iniciado correctamente!"
echo ""
echo "🌐 URLs disponibles:"
echo "   Frontend:        http://localhost:5173"
echo "   API:             http://localhost:3000"
echo "   Health Check:    http://localhost:3000/health"
echo "   Database:        postgres://localhost:5432/panini_db"
echo "   Redis:           redis://localhost:6379"
echo ""

echo "📝 Próximos pasos:"
echo "   1. Abre http://localhost:5173 en tu navegador"
echo "   2. Verifica que el API está respondiendo"
echo "   3. Ejecuta migraciones: docker-compose exec api npm run migrate"
echo ""

echo "📚 Comandos útiles:"
echo "   Ver logs:         docker-compose logs -f"
echo "   Ver API logs:     docker-compose logs -f api"
echo "   Detener:          docker-compose down"
echo "   Limpiar todo:     docker-compose down -v"
echo ""

echo "🎉 ¡Sistema listo para usar!"
