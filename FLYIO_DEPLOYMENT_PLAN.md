# Fly.io Deployment Plan

## 📋 Resumen Ejecutivo

- **Plataforma**: Fly.io (PaaS)
- **Costo**: USD 5-15/mes (auto-scaling included)
- **Deploy**: Automático desde GitHub (5 min setup)
- **Escalado**: Automático según demanda
- **BD**: PostgreSQL integrada (USD 13/mes)
- **Cache**: Upstash Redis (USD 0-10/mes)
- **Tiempo estimado**: 1-2 horas setup completo

---

## 🏗️ Arquitectura en Fly.io

```
GitHub Push (main branch)
    ↓
GitHub Actions Build
    ↓
Push a Docker Registry
    ↓
Fly.io Auto Deploy
    ↓
┌─────────────────────────┐
│  Global CDN             │
│  (múltiples regiones)   │
└──────────────┬──────────┘
               ↓
    ┌──────────────────────┐
    │  Pani App Container  │
    │  (Node API + Nginx)  │
    └──────────────────────┘
               ↓
    ┌──────────────┬───────────────┐
    │              │               │
    PostgreSQL    Upstash Redis
   (Fly.io)       (Managed)
```

---

## Phase 1: Preparación (15 min)

### 1.1 Crear cuenta Fly.io
- Ir a https://fly.io
- Sign up (GitHub auth más fácil)
- Verificar email

### 1.2 Instalar Fly CLI
```bash
# Windows (PowerShell)
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"

# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh
```

### 1.3 Autenticar CLI
```bash
flyctl auth login
# Se abrirá browser para confirmar
```

---

## Phase 2: Crear Configuración (20 min)

### 2.1 Crear app.json (Fly.io app config)
Ya tendremos esto listo.

### 2.2 Crear fly.toml (Main config)
Ya tendremos esto listo.

### 2.3 Crear .env template
Ya tendremos esto listo.

---

## Phase 3: Bases de Datos (10 min)

### 3.1 PostgreSQL en Fly.io
```bash
flyctl postgres create \
  --name pani-db \
  --region sjc \
  --vm-size shared-cpu-1x \
  --initial-cluster-size 1 \
  --volume-size 10
```

**Cost**: USD 13/mes (billed by CPU-hours, shared is cheapest)

### 3.2 Redis en Upstash (Managed)
```bash
# O usar: https://upstash.com (más barato que Fly Redis)
# Crear cuenta Upstash
# Crear DB Redis gratis (3GB)
# Copiar CONNECTION_STRING
```

**Cost**: USD 0-10/mes (free tier available)

---

## Phase 4: Configuración Variables (10 min)

### 4.1 Agregar secrets a Fly.io
```bash
flyctl secrets set \
  DATABASE_URL="postgresql://..." \
  REDIS_URL="redis://..." \
  JWT_SECRET="your-secret" \
  AWS_ACCESS_KEY_ID="..." \
  AWS_SECRET_ACCESS_KEY="..." \
  AWS_S3_BUCKET="pani-stickers" \
  CORS_ORIGIN="https://pani.fly.dev,https://tudominio.com" \
  NODE_ENV="production"
```

---

## Phase 5: Setup GitHub Actions (15 min)

### 5.1 Crear workflow para Fly.io
Ya tendremos este workflow listo.

### 5.2 Agregar FLY_API_TOKEN a GitHub Secrets
```bash
# En Fly.io account
flyctl auth token

# En GitHub
# Settings → Secrets and variables → Actions
# Agregar: FLY_API_TOKEN=<token>
```

---

## Phase 6: Deploy Inicial (10 min)

### 6.1 Deploy manual (testing)
```bash
flyctl deploy
# o
flyctl deploy --local-only
```

### 6.2 Verificar
```bash
flyctl status
flyctl logs
```

### 6.3 Testing
```bash
# App estará en: https://pani.fly.dev

curl https://pani.fly.dev/health
curl https://pani.fly.dev/api/health
```

---

## Phase 7: GitHub Auto-Deploy (Setup)

### 7.1 Push a GitHub
```bash
git add .
git commit -m "feat: fly.io deployment setup"
git push origin main
```

### 7.2 GitHub Actions ejecuta automáticamente
- Detecta fly.toml
- Build + Deploy a Fly.io
- Automático en cada push a main

---

## Phase 8: Monitoreo & Escala (Ongoing)

### 8.1 Ver métricas
```bash
flyctl metrics
flyctl monitor
```

### 8.2 Ver logs
```bash
flyctl logs -f
```

### 8.3 Auto-scaling (ya configurado en fly.toml)
```toml
[metrics]
  port = 9090
  handlers = ["cpu", "memory"]

# Escala automáticamente si CPU > 80%
```

---

## 📊 Costos Estimados

```
Fly.io App (shared-cpu-1x):
  - USD 5/mes base (always-on)
  - +USD 0.0000342/CPU-second extra
  = USD 5-8/mes

PostgreSQL (shared-cpu-1x):
  = USD 13/mes

Redis (Upstash free tier):
  = USD 0-10/mes (free initially)

Dominio:
  = USD 1-2/mes

Total: USD 20-33/mes (vs Hetzner USD 8/mes)
```

**Nota**: Es más caro que Hetzner pero auto-scaling + zero maintenance.

---

## ⚡ Ventajas Fly.io para este proyecto

✅ Deploy automático desde GitHub (5 minutos)
✅ Auto-scaling automático (sin intervención)
✅ SSL/TLS automático
✅ Global CDN (múltiples regiones)
✅ Logs centralizados
✅ Health checks automáticos
✅ Zero downtime deployments
✅ PostgreSQL integrada
✅ Simple CLI para debugging

---

## ⚠️ Limitaciones Fly.io

❌ Más caro que VPS
❌ Menos control que VPS root
❌ No puedes instalar software extra
❌ Funciona mejor con stateless apps
❌ Vendor lock-in (medio)

---

## 🔄 Workflow Típico

```
1. Desarrollar localmente
   git checkout -b feature/algo
   git push

2. Testear en rama
   (sin deploy automático a Fly.io)

3. Merge a main
   git merge feature/algo
   git push origin main

4. GitHub Actions dispara automáticamente
   → Build + Push a Fly.io Registry
   → Fly.io auto-deploy
   → Zero downtime rolling deploy

5. Verificar en https://pani.fly.dev
```

---

## 📋 Checklist Rápido

- [ ] Crear cuenta Fly.io
- [ ] Instalar flyctl
- [ ] Crear app con `flyctl app create`
- [ ] Crear PostgreSQL
- [ ] Setup Upstash Redis
- [ ] Configurar fly.toml
- [ ] Agregar secrets
- [ ] GitHub Action workflow
- [ ] FLY_API_TOKEN en GitHub Secrets
- [ ] Push a main
- [ ] Verificar deploy automático
- [ ] Test endpoints
- [ ] Configurar dominio (opcional)

---

## 🚀 Comandos Esenciales

```bash
# Auth
flyctl auth login

# Create/manage app
flyctl app create pani
flyctl apps list
flyctl status

# Deploy
flyctl deploy
flyctl releases

# Logs & monitoring
flyctl logs
flyctl logs -f          # Follow
flyctl metrics

# Scaling
flyctl scale vm shared-cpu-1x  # Machine type
flyctl scale count 2           # Replicas

# Database
flyctl postgres create pani-db
flyctl postgres list

# Secrets
flyctl secrets set VAR=value
flyctl secrets list

# Domain
flyctl certs create tudominio.com
flyctl certs list

# Cleanup
flyctl destroy
```

---

## 🎯 Diferencia vs Hetzner

| Aspecto | Fly.io | Hetzner |
|---------|--------|---------|
| **Setup** | 1 hora | 2+ horas |
| **Deploy** | Auto (push = live) | Manual |
| **Auto-scale** | ✅ Automático | ❌ Manual |
| **Downtime** | 0 (rolling deploy) | Posible |
| **Control** | 70% | 100% |
| **Costo** | USD 20-30/mes | USD 8/mes |
| **Mantenimiento** | Mínimo | Medio |
| **DevOps** | No necesario | Recomendado |
| **Lock-in** | Sí (medio) | No |

---

## ✅ Cuando todo esté listo

1. **Desarrollo**: Rama feature para cada cambio
2. **Testing**: En rama (sin deploy a Fly.io)
3. **Production**: Push a main = Deploy automático
4. **Monitoreo**: `flyctl logs -f`
5. **Scaling**: Automático (no requiere intervención)

---

**Siguiente**: Ejecutar Phase 1-3 del plan
