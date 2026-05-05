# 🚀 Iniciar Sistema Completo

## Requisitos

- Docker y Docker Compose instalados
- Node.js 18+ (para desarrollo local sin Docker)
- npm o yarn

## Opción 1: Con Docker Compose (Recomendado)

### 1. Preparar ambiente

```bash
# Copiar variables de entorno
cp .env.example .env.local

# O usar directamente el .env.local que ya existe
```

### 2. Iniciar todos los servicios

```bash
docker-compose up -d
```

Esto iniciará:
- ✅ PostgreSQL en puerto 5432
- ✅ Redis en puerto 6379
- ✅ API Backend en puerto 3000
- ✅ Frontend React en puerto 5173

### 3. Ver logs en tiempo real

```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api
docker-compose logs -f frontend
```

### 4. Verificar que todo está funcionando

Abrir en navegador:
- Frontend: http://localhost:5173
- API Health: http://localhost:3000/health
- API Stats: http://localhost:3000/health/stats

### 5. Ejecutar migraciones (primera vez)

```bash
# Dentro del contenedor del API
docker-compose exec api npm run migrate

# O manualmente:
docker-compose exec postgres psql -U panini_user -d panini_db -f /docker-entrypoint-initdb.d/001_initial_schema.sql
```

### 6. Detener servicios

```bash
docker-compose down

# Con limpieza de volúmenes (borra datos)
docker-compose down -v
```

---

## Opción 2: Desarrollo Local (Sin Docker)

### Backend

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Asegurarse de que PostgreSQL y Redis están corriendo localmente
#    (o actualizar .env.local con la dirección correcta)

# 3. Ejecutar migraciones
npm run migrate

# 4. Iniciar servidor en modo desarrollo
npm run dev

# El servidor correrá en http://localhost:3000
```

### Frontend (en otra terminal)

```bash
cd frontend-web

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# El servidor correrá en http://localhost:5173
```

---

## Estructura de Carpetas

```
Pani/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Aplicación Express
│   │   ├── config/
│   │   │   └── database.ts      # Conexión PostgreSQL
│   │   ├── controllers/
│   │   │   └── healthController.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   └── run.ts
│   │   ├── routes/
│   │   │   └── health.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── logger.ts
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
│
├── frontend-web/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml
├── .env.local                  # Variables de entorno local
├── .env.example               # Ejemplo de variables
└── README.md
```

---

## Próximos Pasos

Una vez que el sistema esté corriendo:

1. **Crear autenticación OAuth** (Facebook, Instagram, TikTok)
2. **Crear endpoints de figuritas** (GET, POST, DELETE)
3. **Implementar sistema de escaneo** (cámara y IA)
4. **Crear app móvil** (iOS con Swift, Android con Kotlin)
5. **Configurar almacenamiento de imágenes** (AWS S3)

---

## Comandos Útiles

### Logs

```bash
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs postgres
```

### Base de Datos

```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U panini_user -d panini_db

# Ver tablas
\dt

# Ver usuarios
SELECT * FROM users;

# Salir
\q
```

### Rebuild

```bash
# Reconstruir todas las imágenes
docker-compose build --no-cache

# Reconstruir solo el API
docker-compose build --no-cache api
```

### Limpiar

```bash
# Eliminar todo
docker-compose down -v

# Eliminar solo contenedores
docker-compose down

# Eliminar volúmenes
docker volume rm panini_postgres_data panini_redis_data
```

---

## Troubleshooting

### Puerto 3000 ya está en uso

```bash
# Cambiar puerto en docker-compose.yml
# Cambiar "3000:3000" a "3001:3000"

# O matar proceso:
lsof -i :3000
kill -9 <PID>
```

### Errores de conexión a BD

```bash
# Verificar que postgres está sano
docker-compose ps

# Ver logs de postgres
docker-compose logs postgres

# Esperar a que postgres inicie completamente
docker-compose up -d postgres
sleep 10
docker-compose up -d api
```

### Rebuild después de cambios

```bash
# Si cambias dependencias en package.json
docker-compose build --no-cache api
docker-compose up -d api

# Si cambias migrations
docker-compose exec api npm run migrate
```

---

## Variables de Entorno Importantes

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Ambiente | `development`, `production` |
| `PORT` | Puerto del API | `3000` |
| `DB_HOST` | Host de PostgreSQL | `postgres` (Docker), `localhost` (local) |
| `DB_USER` | Usuario de BD | `panini_user` |
| `DB_PASSWORD` | Contraseña de BD | `panini_dev_password` |
| `REDIS_HOST` | Host de Redis | `redis` (Docker), `localhost` (local) |
| `JWT_SECRET` | Secret para JWT | Cualquier string aleatorio |
| `CORS_ORIGIN` | Orígenes permitidos | `http://localhost:5173` |
| `VITE_API_URL` | URL del API para frontend | `http://localhost:3000` |

---

¡El sistema está listo para desarrollar! 🎉
