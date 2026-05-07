# Fly.io Deployment Checklist

## Phase 1: Pre-requisites

- [ ] Crear cuenta en [Fly.io](https://fly.io)
- [ ] Instalar Flyctl CLI
  - Windows: `pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"`
  - macOS: `brew install flyctl`
  - Linux: `curl -L https://fly.io/install.sh | sh`
- [ ] Autenticar: `flyctl auth login`
- [ ] Verificar: `flyctl auth whoami`

## Phase 2: App Configuration

- [ ] `fly.toml` - Creado ✅
- [ ] `Dockerfile.fly` - Creado ✅
- [ ] `app.json` - Creado ✅
- [ ] `.github/workflows/deploy-flyio.yml` - Creado ✅
- [ ] `.env.flyio.example` - Creado ✅

## Phase 3: Database Setup

- [ ] Crear PostgreSQL en Fly.io
  ```bash
  flyctl postgres create \
    --name pani-db \
    --region sjc \
    --initial-cluster-size 1 \
    --volume-size 10 \
    --password-prompt
  ```
  - [ ] Anotar DATABASE_URL generada

- [ ] Crear o configurar Redis (Upstash recomendado)
  - [ ] Ir a https://upstash.com
  - [ ] Crear cuenta
  - [ ] Crear Redis database (free tier)
  - [ ] Copiar REDIS_URL

## Phase 4: Fly.io App Setup

- [ ] Crear app: `flyctl app create pani`
- [ ] Seleccionar región (ej: sjc)
- [ ] Adjuntar PostgreSQL: `flyctl postgres attach pani-db --variable DATABASE_URL`

## Phase 5: Environment Variables & Secrets

- [ ] Generar JWT_SECRET: 
  ```bash
  openssl rand -base64 32  # Linux/Mac
  # O generar uno en https://generate-random.org/
  ```

- [ ] Configurar AWS S3 (opcional pero recomendado):
  - [ ] AWS_ACCESS_KEY_ID
  - [ ] AWS_SECRET_ACCESS_KEY
  - [ ] AWS_S3_BUCKET (ej: pani-stickers)

- [ ] Establecer todos los secrets:
  ```bash
  flyctl secrets set \
    JWT_SECRET="your-secret" \
    REDIS_URL="your-redis-url" \
    AWS_ACCESS_KEY_ID="key" \
    AWS_SECRET_ACCESS_KEY="secret" \
    AWS_S3_BUCKET="pani-stickers" \
    CORS_ORIGIN="https://pani.fly.dev" \
    NODE_ENV="production"
  ```

- [ ] Verificar secrets: `flyctl secrets list`

## Phase 6: Initial Deployment

- [ ] Testear build localmente (opcional):
  ```bash
  docker build -f Dockerfile.fly -t pani-test .
  docker run -it pani-test npm run migrate
  ```

- [ ] Hacer deploy inicial:
  ```bash
  flyctl deploy --remote-only
  ```

- [ ] Ver status: `flyctl status`
- [ ] Ver logs: `flyctl logs`
- [ ] Verificar health:
  ```bash
  curl https://pani.fly.dev/health
  curl https://pani.fly.dev/api/health
  ```

## Phase 7: GitHub Setup (Auto-Deploy)

- [ ] Commit cambios a GitHub:
  ```bash
  git add .
  git commit -m "feat: fly.io deployment setup"
  git push origin main
  ```

- [ ] Generar FLY_API_TOKEN:
  ```bash
  flyctl auth token
  ```

- [ ] Agregar a GitHub Secrets:
  - Ir a: Repo → Settings → Secrets and variables → Actions
  - Crear nuevo secret: `FLY_API_TOKEN`
  - Pegar el token

- [ ] Verificar workflow:
  - `.github/workflows/deploy-flyio.yml` debe existir
  - Push a main debe triggerear build automático

## Phase 8: Testing & Verification

- [ ] Hacer push a rama de feature (no despliega):
  ```bash
  git checkout -b feature/test-something
  git push origin feature/test-something
  ```
  - Verificar que NO despliega a Fly.io

- [ ] Hacer push a main (despliega):
  ```bash
  git checkout main
  git merge feature/test-something
  git push origin main
  ```
  - Ir a GitHub → Actions
  - Ver workflow ejecutarse
  - Esperar a que complete

- [ ] Verificar endpoints:
  ```bash
  curl https://pani.fly.dev/health
  curl https://pani.fly.dev/api/health
  curl https://pani.fly.dev/
  ```

- [ ] Ver logs en tiempo real:
  ```bash
  flyctl logs -f
  ```

- [ ] Verificar recursos:
  ```bash
  flyctl metrics
  flyctl status
  ```

## Phase 9: Production Optimization (Opcional)

- [ ] Configurar dominio personalizado:
  ```bash
  flyctl certs create tudominio.com
  ```

- [ ] Agregar réplicas para redundancia:
  ```bash
  flyctl scale count 2
  ```

- [ ] Cambiar machine type si es necesario:
  ```bash
  flyctl scale vm shared-cpu-2x  # Más poder
  ```

- [ ] Ver/ajustar auto-scaling:
  - Editar `fly.toml` - sección `[metrics]`

## Phase 10: Monitoring & Maintenance

- [ ] Configurar alertas (opcional):
  - Dashboard de Fly.io

- [ ] Revisar logs regularmente:
  ```bash
  flyctl logs -f
  ```

- [ ] Monitoring de métricas:
  ```bash
  flyctl monitor
  ```

- [ ] Backup de BD:
  ```bash
  flyctl postgres backup create pani-db
  ```

## Issues & Troubleshooting

### Build falla
- [ ] Ver logs: `flyctl logs`
- [ ] Verificar `Dockerfile.fly` es correcto
- [ ] Verificar `package.json` tiene scripts: `build`, `start`, `migrate`

### App no inicia
- [ ] Ver logs: `flyctl logs -f`
- [ ] Verificar DATABASE_URL está set
- [ ] Verificar migraciones corren: `flyctl releases`
- [ ] Verificar puerto es 8080

### Health check falla
- [ ] Verificar endpoint `/health` existe en API
- [ ] Ver logs de salud: `flyctl logs | grep health`
- [ ] Modificar health check en `fly.toml` si es necesario

### Database connection error
- [ ] Verificar DATABASE_URL: `flyctl secrets list`
- [ ] Verificar PostgreSQL está running: `flyctl postgres status`
- [ ] Re-adjuntar: `flyctl postgres attach pani-db --force`

### Redis connection error
- [ ] Verificar REDIS_URL: `flyctl secrets list`
- [ ] Verificar Redis está accessible desde app region
- [ ] Si usas Upstash, verificar allowlist IPs

### Fuera de presupuesto
- [ ] Revisar facturación: `flyctl billing`
- [ ] Ver detalle de cargos: https://fly.io/dashboard/billing
- [ ] Reducir replicas: `flyctl scale count 1`
- [ ] Cambiar a machine más pequeña

## Cost Tracking

- [ ] Configurar billing alerts en Fly.io dashboard
- [ ] Revisar facturación mensual
- [ ] Documentar costos por componente:
  - [ ] App: USD 5-10/mes
  - [ ] PostgreSQL: USD 13/mes
  - [ ] Redis (Upstash): USD 0-5/mes
  - [ ] **Total estimado**: USD 18-28/mes

## Cleanup (Si necesitas destruir)

```bash
# Destruir app pero preservar DB
flyctl destroy

# O destruir todo (cuidado: elimina BD)
flyctl apps destroy
flyctl postgres destroy pani-db
```

---

## Comandos Importantes Resumen

```bash
# Status & Info
flyctl status                    # Ver estado actual
flyctl info                      # Información completa
flyctl metrics                   # Ver métricas (CPU, RAM, etc)
flyctl monitor                   # Monitoreo en tiempo real

# Logs & Debugging
flyctl logs                      # Ver logs
flyctl logs -f                   # Logs en tiempo real
flyctl logs --lines 100          # Últimas 100 líneas
flyctl logs -a app-name          # Logs de app específica

# Deployment
flyctl deploy                    # Deploy local
flyctl deploy --remote-only      # Build en Fly.io servers
flyctl releases                  # Ver histórico de deploys
flyctl releases --limit 10       # Últimos 10 deploys

# Database
flyctl postgres create           # Crear BD
flyctl postgres attach           # Conectar BD a app
flyctl postgres list             # Listar BDs
flyctl postgres backup create    # Crear backup

# Secrets & Config
flyctl secrets set VAR=value     # Set secret
flyctl secrets list              # Listar secrets
flyctl config show               # Ver configuración

# Scaling
flyctl scale vm shared-cpu-1x    # Cambiar machine type
flyctl scale count 2             # 2 replicas
flyctl autoscale set min=1 max=3 # Auto-scaling

# SSH & Shell
flyctl ssh console               # SSH a la máquina

# Cleanup
flyctl destroy                   # Destruir app
flyctl apps destroy              # Destruir múltiples apps
```

---

## Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io CLI Reference](https://fly.io/docs/reference/flyctl/)
- [PostgreSQL on Fly.io](https://fly.io/docs/reference/postgres/)
- [Environment Variables](https://fly.io/docs/reference/secrets/)
- [Dockerfile Tips](https://fly.io/docs/languages-and-frameworks/dockerfile/)

---

**Status**: ✅ Checklist completo
**Next**: Ejecutar el setup automático
