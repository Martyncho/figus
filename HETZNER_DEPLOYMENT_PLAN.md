# Plan de Implementación en Hetzner Cloud

## Resumen Ejecutivo
- **Presupuesto**: USD 8-11/mes
- **Infra**: Hetzner CX22 (2 vCPU, 4GB RAM, 40GB SSD)
- **Stack**: Docker Compose + Nginx + PostgreSQL + Redis + S3
- **CI/CD**: GitHub Actions → GHCR → Hetzner VPS
- **Tiempo estimado**: 4-6 horas setup completo

---

## Fase 1: Setup Inicial en Hetzner (30-45 min)

### 1.1 Crear cuenta y servidor
1. Ir a [Hetzner Cloud Console](https://console.hetzner.cloud)
2. Crear proyecto: `Pani-App`
3. Crear server:
   - **Imagen**: Ubuntu 24.04 LTS
   - **Tipo**: CX22
   - **Región**: Elegir más cercana (Frankfurt EU-Central, Helsinki EU-North, etc.)
   - **SSH Key**: Agregar tu clave pública
   - **Name**: `pani-prod`
   - **Volumen** (opcional): No necesario aún

### 1.2 Configuración inicial del servidor
```bash
# SSH al server
ssh root@<IP_PUBLICA>

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install -y docker-compose-plugin

# Verificar
docker --version
docker compose version

# Crear usuario no-root (recomendado)
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
su - deploy

# Crear estructura de carpetas
mkdir -p ~/pani-app/{config,backups,data}
cd ~/pani-app
```

### 1.3 Configurar firewall en Hetzner
1. En console → Firewalls
2. Crear: `pani-firewall`
3. Reglas:
   - Entrada: HTTP (80) - todos
   - Entrada: HTTPS (443) - todos
   - Entrada: SSH (22) - solo tu IP
   - Salida: Permitir todo
4. Asignar al server

### 1.4 Configurar DNS
1. Comprar dominio (Namecheap, Google Domains, etc.) o usar existente
2. En Hetzner → DNS
3. Crear zona: `tudominio.com`
4. Cambiar nameservers en registrar:
   ```
   ns1.hetzner.com
   ns2.hetzner.com
   ns3.hetzner.com
   ```
5. Crear registros:
   ```
   @ (root)      A  <IP_HETZNER>
   api           A  <IP_HETZNER>
   app           A  <IP_HETZNER>
   www           A  <IP_HETZNER>
   ```

---

## Fase 2: Preparar Docker Compose (1-2 horas)

### 2.1 Actualizar `docker-compose.yml`
Crear en `~/pani-app/docker-compose.yml`:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: pani-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/ssl:/etc/nginx/ssl:ro
      - ./frontend-build:/usr/share/nginx/html:ro
    depends_on:
      - api
    networks:
      - pani-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    image: ghcr.io/<TU_USUARIO>/pani-api:latest
    container_name: pani-api
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://pani_user:${DB_PASSWORD}@postgres:5432/pani_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_REGION: us-east-1
      AWS_S3_BUCKET: ${AWS_S3_BUCKET}
      PORT: 3000
    depends_on:
      - postgres
      - redis
    networks:
      - pani-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    container_name: pani-postgres
    environment:
      POSTGRES_USER: pani_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: pani_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - pani-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pani_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: pani-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - pani-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_data:
  redis_data:

networks:
  pani-network:
    driver: bridge
```

### 2.2 Crear `.env` (en servidor Hetzner)
```bash
# En ~/pani-app/.env
NODE_ENV=production
DB_PASSWORD=<genera_password_fuerte>
REDIS_PASSWORD=<genera_password_fuerte>
JWT_SECRET=<genera_secret_fuerte>
AWS_ACCESS_KEY_ID=<tu_aws_key>
AWS_SECRET_ACCESS_KEY=<tu_aws_secret>
AWS_S3_BUCKET=pani-stickers
```

**Seguridad**: Restricciones de permisos
```bash
chmod 600 .env
```

### 2.3 Configuración de Nginx
Crear `~/pani-app/config/nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS
    server {
        listen 443 ssl http2;
        server_name tudominio.com *.tudominio.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Frontend (React static)
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            expires 1h;
            add_header Cache-Control "public, immutable";
        }

        # API
        location /api {
            proxy_pass http://api:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_buffering off;
        }

        # Health checks (sin logs)
        location /health {
            proxy_pass http://api:3000/health;
            access_log off;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }
}
```

### 2.4 Obtener SSL con Certbot
```bash
# En el servidor
ssh deploy@<IP>

# Instalar certbot
sudo apt install -y certbot

# Generar certificado (con nginx detenido temporalmente)
sudo certbot certonly --standalone -d tudominio.com -d api.tudominio.com -d app.tudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem ~/pani-app/config/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem ~/pani-app/config/ssl/key.pem
sudo chown deploy:deploy ~/pani-app/config/ssl/*

# Renovación automática (cron)
sudo certbot renew --quiet
# Agregar a crontab: 0 3 * * * /usr/bin/certbot renew --quiet && docker compose -f /home/deploy/pani-app/docker-compose.yml restart nginx
```

---

## Fase 3: CI/CD con GitHub Actions (45 min)

### 3.1 Crear acceso a GHCR
En GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Crear token con scope `write:packages, read:packages`
- Copiar token

En repositorio Pani → Settings → Secrets and variables → Actions:
```
REGISTRY_TOKEN = <token_anterior>
HETZNER_HOST = <IP_publica_hetzner>
HETZNER_USER = deploy
HETZNER_SSH_KEY = <tu_private_key>
DB_PASSWORD = <de_.env>
REDIS_PASSWORD = <de_.env>
JWT_SECRET = <de_.env>
AWS_ACCESS_KEY_ID = <tu_aws>
AWS_SECRET_ACCESS_KEY = <tu_aws>
AWS_S3_BUCKET = pani-stickers
```

### 3.2 Crear workflows
Crear `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy to Hetzner

on:
  push:
    branches: [main, develop]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME_API: ${{ github.repository }}-api
  IMAGE_NAME_FRONT: ${{ github.repository }}-frontend

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.REGISTRY_TOKEN }}

      # Build Backend
      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_API }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_API }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # Build Frontend
      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend-web
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_FRONT }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_FRONT }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Hetzner
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: ${{ secrets.HETZNER_USER }}
          key: ${{ secrets.HETZNER_SSH_KEY }}
          script: |
            cd ~/pani-app
            
            # Actualizar .env con secretos
            cat > .env << EOF
            NODE_ENV=production
            DB_PASSWORD=${{ secrets.DB_PASSWORD }}
            REDIS_PASSWORD=${{ secrets.REDIS_PASSWORD }}
            JWT_SECRET=${{ secrets.JWT_SECRET }}
            AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}
            AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}
            AWS_S3_BUCKET=${{ secrets.AWS_S3_BUCKET }}
            EOF
            
            # Login a GHCR
            echo ${{ secrets.REGISTRY_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            # Traer últimas imágenes
            docker compose pull
            
            # Reiniciar servicios
            docker compose up -d
            
            # Logs
            docker compose logs api
```

### 3.3 Deploy manual (primera vez)
```bash
# En servidor Hetzner
cd ~/pani-app

# Login a GHCR
echo "<TU_TOKEN>" | docker login ghcr.io -u <tu_usuario> --password-stdin

# Traer imágenes (construidas en GitHub Actions)
docker compose pull

# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f api
```

---

## Fase 4: Base de Datos & Backups (30 min)

### 4.1 Iniciar PostgreSQL y ejecutar migraciones
```bash
# SSH al servidor
ssh deploy@<IP>
cd ~/pani-app

# Ver estado
docker compose ps

# Ejecutar migraciones (ajusta según tu setup)
docker compose exec api npx ts-node src/migrations/run.ts

# Verificar BD
docker compose exec postgres psql -U pani_user -d pani_db -c "\dt"
```

### 4.2 Script de backup automático
Crear `~/pani-app/backup.sh`:

```bash
#!/bin/bash

# Variables
BACKUP_DIR="/home/deploy/pani-app/backups"
DB_CONTAINER="pani-postgres"
DB_USER="pani_user"
DB_NAME="pani_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pani_db_$TIMESTAMP.sql.gz"

# Crear backup
docker compose exec -T postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Subir a S3
aws s3 cp $BACKUP_FILE s3://pani-stickers/backups/ --region us-east-1

# Limpiar backups locales antiguos (más de 7 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completado: $BACKUP_FILE"
```

Hacer ejecutable:
```bash
chmod +x ~/pani-app/backup.sh
```

Agregar a crontab (cron job diario a las 3 AM UTC):
```bash
crontab -e

# Agregar línea:
0 3 * * * cd /home/deploy/pani-app && ./backup.sh >> /home/deploy/pani-app/backups/cron.log 2>&1
```

### 4.3 Configurar AWS S3
```bash
# En tu máquina local
aws configure --profile pani

# En servidor, instalar AWS CLI
sudo apt install -y awscli

# Agregar credenciales en servidor (para cron)
mkdir -p ~/.aws
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = <tu_key>
aws_secret_access_key = <tu_secret>
EOF

chmod 600 ~/.aws/credentials
```

---

## Fase 5: Monitoreo Básico (30 min)

### 5.1 Health checks
```bash
# Verificar servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f --tail=50
```

### 5.2 Monitoreo de recursos (opcional: Portainer o netdata)
**Opción simple: Portainer**
```bash
cd ~/pani-app
docker compose exec -it nginx sh

# Dentro del contenedor:
curl http://api:3000/health
```

**Opción avanzada: Netdata** (ligero, gratis)
```bash
sudo sh -c 'wget -O - https://get.netdata.cloud/kickstart.sh | sh'
# Acceder en: http://<IP>:19999
```

### 5.3 Alertas básicas (script)
Crear `~/pani-app/health-check.sh`:

```bash
#!/bin/bash

API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://api:3000/health)

if [ "$API_HEALTH" != "200" ]; then
    echo "⚠️ API no responde correctamente: $API_HEALTH"
    # Opcional: enviar email con sendmail, etc.
fi

# Revisar espacio en disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️ Disco lleno: ${DISK_USAGE}%"
fi
```

Agregar a crontab cada 15 minutos:
```bash
*/15 * * * * /home/deploy/pani-app/health-check.sh
```

---

## Fase 6: Documentación & Runbooks (30 min)

### 6.1 Cheatsheet de comandos
```bash
# Ver estado
docker compose ps

# Ver logs (últimas 50 líneas en tiempo real)
docker compose logs -f --tail=50

# Reiniciar un servicio
docker compose restart api

# Detener todo
docker compose down

# Iniciar todo
docker compose up -d

# Entrar en BD
docker compose exec postgres psql -U pani_user -d pani_db

# Entrar en Redis
docker compose exec redis redis-cli -a <REDIS_PASSWORD>

# Ver uso de recursos
docker stats

# Limpiar imágenes/volumes sin usar
docker system prune -a

# Forzar redeploy (pull imágenes nuevas)
docker compose pull && docker compose up -d
```

### 6.2 Troubleshooting común
| Problema | Solución |
|----------|----------|
| API no inicia | `docker compose logs api` - revisar .env variables |
| BD no conecta | `docker compose exec postgres pg_isready` |
| SSL error Nginx | Verificar permisos: `ls -la config/ssl/` |
| Puerto 80/443 ocupado | `sudo lsof -i :80` / `sudo lsof -i :443` |
| Redis lleno | `docker compose exec redis redis-cli FLUSHDB` (⚠️ destructivo) |

---

## Timeline & Checklist

- [ ] **Día 1 (2h)**: Setup Hetzner, DNS, servidor Ubuntu, Docker
- [ ] **Día 1 (2h)**: Docker Compose + Nginx + SSL
- [ ] **Día 2 (1h)**: GitHub Actions CI/CD
- [ ] **Día 2 (1h)**: Backups + Monitoreo
- [ ] **Día 3**: Testing en producción, ajustes

---

## Costos Mensuales Finales

| Servicio | Costo |
|----------|-------|
| Hetzner VPS CX22 | USD 7 |
| Dominio .com (anual ÷ 12) | USD 1-2 |
| S3 + backups (estimado) | USD 1-2 |
| **Total** | **USD 9-11** |

---

## Siguientes Pasos

1. **Crear recursos en Hetzner** (cuenta + VPS)
2. **Preparar repositorio GitHub** con workflows
3. **Configurar variables secretas**
4. **Primera ejecución manual** del deploy
5. **Testing** en producción
6. **Monitoreo** en vivo

¿Por dónde querés empezar?
