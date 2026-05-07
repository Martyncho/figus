# 🚀 Fly.io Deployment - START HERE

## ✅ LISTA DE VERIFICACIÓN PRE-SETUP

### 1. Requisitos Previos
```powershell
# Windows - Abrir PowerShell como Admin

# 1. Verifica que tienes flyctl
flyctl version
# Si falla, instalar:
# pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"

# 2. Verifica que tienes Git
git --version

# 3. Verifica que estás en el repo correcto
cd c:\source\Pani
pwd  # Debe mostrar: C:\source\Pani
```

### 2. Crear Cuenta Fly.io (Si no tienes)
- Ir a: https://fly.io
- Sign up (más fácil con GitHub)
- Verificar email

### 3. Autenticar con Fly
```powershell
flyctl auth login
# Se abrirá navegador, autoriza
# Vuelve aquí cuando termine

# Verifica que funciona
flyctl auth whoami
# Debe mostrar tu usuario
```

---

## 🎯 OPCIÓN A: Setup Automático (RECOMENDADO)

### Paso 1: Ejecutar Script

**Windows (PowerShell):**
```powershell
# En la carpeta C:\source\Pani
.\setup-flyio.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-flyio.sh
./setup-flyio.sh
```

### Paso 2: Responder Prompts

El script preguntará:
```
Enter app name (e.g., pani) or press Enter for 'pani'
→ Presiona Enter (o escribe un nombre diferente)

Enter region (default: sjc)
→ Presiona Enter (USA West Coast) o escribe otro (ej: cdg para Europa)

Create PostgreSQL? (y/n, default: y)
→ Presiona Enter (SÍ, crear BD)
→ Escribe contraseña cuando pida

Paste Redis connection URL...
→ Si no tienes Upstash, deja en blanco por ahora
→ Puedes agregarlo después

JWT Secret (or press Enter for auto-generated)
→ Presiona Enter (genera automático)

AWS Access Key...
→ Presiona Enter (opcional, puedes agregarlo después)

CORS Origin...
→ Presiona Enter (usa default: https://pani.fly.dev)
```

### Paso 3: Esperar Deploy
- El script compilará y deployará (~5-10 minutos)
- Espera a que veas el mensaje verde: ✅ Fly.io Setup Complete!

### Paso 4: Verificar

```powershell
# Ver status
flyctl status

# Ver logs
flyctl logs -f

# Testear endpoints (en otra terminal)
curl https://pani.fly.dev/health
curl https://pani.fly.dev/api/health
curl https://pani.fly.dev/
```

---

## 🎯 OPCIÓN B: Setup Manual (Si Script Falla)

### Paso 1: Crear App
```powershell
flyctl app create pani
```

### Paso 2: Crear PostgreSQL
```powershell
flyctl postgres create `
  --name pani-db `
  --region sjc `
  --initial-cluster-size 1 `
  --volume-size 10 `
  --password-prompt
```
**Guarda la DATABASE_URL que se muestra**

### Paso 3: Adjuntar PostgreSQL
```powershell
flyctl postgres attach pani-db `
  --app pani `
  --variable DATABASE_URL
```

### Paso 4: Configurar Redis (Opcional Ahora)
- Ve a: https://upstash.com
- Crea cuenta y Redis DB (tier gratis)
- Copia la REDIS_URL

### Paso 5: Establecer Secretos
```powershell
# JWT Secret aleatorio
$jwt = [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))

# Establecer todos
flyctl secrets set `
  JWT_SECRET="$jwt" `
  CORS_ORIGIN="https://pani.fly.dev" `
  AWS_S3_BUCKET="pani-stickers" `
  NODE_ENV="production" `
  --app pani

# Si tienes Redis
# flyctl secrets set REDIS_URL="your-upstash-url" --app pani

# Si tienes AWS
# flyctl secrets set AWS_ACCESS_KEY_ID="key" AWS_SECRET_ACCESS_KEY="secret" --app pani
```

### Paso 6: Deploy
```powershell
flyctl deploy --remote-only --app pani
```

### Paso 7: Verificar
```powershell
flyctl status --app pani
flyctl logs -f --app pani
```

---

## 🔄 SETUP AUTO-DEPLOY (GitHub)

### Paso 1: Commit a GitHub
```powershell
# Asegúrate de estar en main
git status

# Agregar cambios
git add .

# Commit
git commit -m "feat: fly.io deployment setup"

# Push
git push origin main
```

### Paso 2: Obtener FLY_API_TOKEN
```powershell
flyctl auth token
# Copia el token que se muestra
```

### Paso 3: Agregar a GitHub Secrets
1. Ve a tu repo en GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Name: `FLY_API_TOKEN`
5. Value: Pega el token
6. Add secret

### Paso 4: Verificar Auto-Deploy
1. Ve a GitHub → Actions
2. Deberías ver un workflow corriendo: "Deploy to Fly.io"
3. Espera a que complete (verde = éxito)
4. Tu app está vivo en: https://pani.fly.dev

### Paso 5: Testing del Workflow
```powershell
# Hacer un cambio pequeño
git checkout -b feature/test
echo "# Test" >> README.md
git add README.md
git commit -m "test: verify workflow"
git push origin feature/test
# NO despliega (solo en feature branches)

# Merge a main para desplegar
git checkout main
git merge feature/test
git push origin main
# DESPLIEGA automáticamente (ve a GitHub → Actions)
```

---

## ✅ VERIFICACIÓN POST-DEPLOY

```powershell
# 1. App running?
flyctl status
# Debe mostrar: running

# 2. Health check?
curl https://pani.fly.dev/health
# Debe retornar: 200 OK

# 3. API responds?
curl https://pani.fly.dev/api/health
# Debe retornar: 200 OK

# 4. Frontend loads?
curl https://pani.fly.dev/
# Debe retornar HTML

# 5. Database connected?
flyctl logs | Select-String "error" -NotMatch
# No debe haber "connection error"

# 6. Auto-deploy working?
# Ir a GitHub → Actions → Último workflow
# Debe estar en verde ✅
```

---

## 💰 VERIFICAR COSTOS

```powershell
# Ver facturación
flyctl billing
# O visita: https://fly.io/dashboard/billing

# Esperado para MVP:
# - Fly.io app: USD 5-10/mes
# - PostgreSQL: USD 13/mes
# - Total: ~USD 20/mes (sin Redis/AWS)
```

---

## 🔧 COMANDOS ÚTILES DÍA A DÍA

```powershell
# Ver estado
flyctl status

# Ver logs en vivo
flyctl logs -f

# Ver métricas (CPU, RAM)
flyctl metrics

# Restart app
flyctl apps restart

# SSH a la máquina
flyctl ssh console

# Destruir app (si cambias de idea)
flyctl destroy
```

---

## 🆘 SI ALGO SALE MAL

### Deploy falla
```powershell
# Ver logs
flyctl logs -f

# Ver releases
flyctl releases

# Rollback a anterior
flyctl releases rollback
```

### App no inicia
```powershell
# Ver más detalles
flyctl logs -f --lines 100

# Común: puerto incorrecto
# Verificar fly.toml: internal_port debe ser 8080

# Común: variable no set
flyctl secrets list
```

### Database connection error
```powershell
# Verificar BD exists
flyctl postgres status

# Re-attach
flyctl postgres attach pani-db --force

# Verificar DATABASE_URL
flyctl secrets list
```

### Fuera de presupuesto
```powershell
# Ver costos
flyctl billing

# Reducir replicas
flyctl scale count 1

# Cambiar a máquina más pequeña
flyctl scale vm shared-cpu-1x
```

---

## 📚 DOCUMENTACIÓN COMPLETA

Si necesitas más detalles:

- **Plan Detallado**: `FLYIO_DEPLOYMENT_PLAN.md`
- **Quick Reference**: `FLYIO_QUICK_START.md`
- **Checklist Completo**: `FLYIO_CHECKLIST.md`
- **Todas las Opciones**: `DEPLOYMENT_OPTIONS.md`

---

## 🎯 TIMELINE

```
Ahora:
  ├─ Ejecutar setup script (10-15 min)
  │  └─ App vivo en https://pani.fly.dev
  │
  ├─ Commit a GitHub (5 min)
  │  └─ Código en repositorio
  │
  ├─ Agregar GitHub Secret (5 min)
  │  └─ Auto-deploy configurado
  │
  ├─ Test endpoints (2 min)
  │  └─ Verificar funciona
  │
  └─ Monitor logs (ongoing)
     └─ Ver en vivo: flyctl logs -f

Total: ~30-40 minutos para setup completo
```

---

## ✨ VENTAJAS FLY.IO

✅ Deploy super fácil (`git push` = live)
✅ Auto-scaling automático (sin intervención)
✅ SSL/TLS gratis y automático
✅ Múltiples regiones globales
✅ Zero downtime deployments
✅ PostgreSQL integrada
✅ Logs centralizados
✅ Health checks automáticos

---

## 🚀 READY?

**Opción A (Automático):**
```powershell
.\setup-flyio.ps1
```

**O Opción B (Manual):**
Sigue [FLYIO_CHECKLIST.md](FLYIO_CHECKLIST.md)

**Luego:**
```powershell
git add .
git commit -m "feat: fly.io deployment"
git push origin main
# Y listo! Auto-deploy activo
```

---

**¿Preguntas?** Ve a `FLYIO_READY.md` o `FLYIO_QUICK_START.md`

**¡Vamos! 🚀**
