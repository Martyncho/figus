# Testing Local - Production Setup

Guía para testear la configuración de producción localmente antes de desplegar en Hetzner.

## 1. Preparar ambiente local

```bash
# Crear carpetas necesarias
mkdir -p config/ssl
mkdir -p backups

# Copiar configuración de Nginx
# (ya debe estar en config/nginx-proxy.conf)
```

## 2. Crear archivo .env local

```bash
# Copiar desde template
cp .env.prod.example .env

# Editar .env con valores para testing local
cat > .env << 'EOF'
DB_NAME=pani_db
DB_USER=pani_user
DB_PASSWORD=testpass123
REDIS_PASSWORD=redispass123
JWT_SECRET=test_jwt_secret_12345
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=pani-stickers
CORS_ORIGIN=http://localhost
NODE_ENV=production
EOF

chmod 600 .env
```

## 3. Verificar Dockerfiles

✅ **Backend** (`backend/Dockerfile`)
- Multistage build
- Production dependencies only
- Health check incluido

✅ **Frontend** (`frontend-web/Dockerfile`)  
- Multistage build
- Build estático con Vite
- Nginx incluido
- `nginx.conf` debe estar en `frontend-web/`

## 4. Ejecutar docker-compose para producción

```bash
# Compilar y iniciar servicios
docker compose -f docker-compose.prod.yml up --build

# En otra terminal, ver logs
docker compose -f docker-compose.prod.yml logs -f

# Ver estado de servicios
docker compose -f docker-compose.prod.yml ps
```

## 5. Testear endpoints

```bash
# Health check API
curl http://localhost/health

# Frontend (debería servir index.html)
curl http://localhost/

# API health directo
curl http://localhost/api/health

# Listar figuritas (ejemplo)
curl http://localhost/api/figuritas
```

## 6. Troubleshooting común

### Frontend no se sirve
```bash
# Ver logs del frontend
docker compose -f docker-compose.prod.yml logs frontend

# Verificar que el build funcionó
docker compose -f docker-compose.prod.yml exec frontend ls -la /usr/share/nginx/html/

# Si está vacío, el build de Vite falló
```

### API no responde
```bash
# Ver logs del API
docker compose -f docker-compose.prod.yml logs api

# Verificar conexión a base de datos
docker compose -f docker-compose.prod.yml exec api npx ts-node -e "console.log(process.env.DATABASE_URL)"

# Verificar que las migraciones corrieron
docker compose -f docker-compose.prod.yml exec postgres psql -U pani_user -d pani_db -c "\dt"
```

### Base de datos
```bash
# Entrar en PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U pani_user -d pani_db

# Ver tablas
\dt

# Salir
\q
```

### Redis
```bash
# Entrar en Redis CLI
docker compose -f docker-compose.prod.yml exec redis redis-cli -a testpass123

# Ping
PING

# Ver keys
KEYS *

# Salir
EXIT
```

## 7. Detener servicios

```bash
# Graceful shutdown
docker compose -f docker-compose.prod.yml down

# Con purga de datos (CUIDADO: borra BD)
docker compose -f docker-compose.prod.yml down -v
```

## 8. Ver recursos

```bash
# CPU, memoria, I/O
docker stats

# Imágenes
docker images

# Volúmenes
docker volume ls
```

## 9. Verificar antes de deployar a Hetzner

- [ ] `docker compose -f docker-compose.prod.yml up` funciona sin errores
- [ ] Frontend sirve en http://localhost/
- [ ] API responde en http://localhost/api/health
- [ ] Base de datos está migrada (`\dt` muestra tablas)
- [ ] Redis está funcionando (`PING` retorna PONG)
- [ ] Nginx revierte el proxy correctamente
- [ ] Logs no tienen errores críticos

## 10. Comandos útiles para testing

```bash
# Ver todo
docker compose -f docker-compose.prod.yml config

# Reconstruir una imagen
docker compose -f docker-compose.prod.yml build --no-cache api

# Ejecutar comando en contenedor
docker compose -f docker-compose.prod.yml exec api npm run build

# Copiar archivo del contenedor
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U pani_user pani_db > backup.sql

# Ver red
docker network ls
docker network inspect pani_network
```

## 11. Limpieza después del testing

```bash
# Remover containers y redes (no toca volúmenes)
docker compose -f docker-compose.prod.yml down

# Limpiar todo
docker system prune -a --volumes
```

---

**Cuando todo funcione localmente:**
1. Commitea los cambios a `main`
2. GitHub Actions compilará las imágenes
3. Deploy manual a Hetzner o automático si tienes el workflow
