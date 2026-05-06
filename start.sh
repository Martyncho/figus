#!/bin/bash
# This file is deprecated and kept only for compatibility.
# The application now uses npm scripts for local development.
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
