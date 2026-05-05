# Quick Start Guide - Panini App

## 🎯 Objetivo
Guía rápida para empezar a contribuir en el proyecto Panini Figuritas.

## ⏱️ Tiempo Estimado: 30 minutos

## 📦 Requisitos

### Instalados Previamente
```bash
# Verificar que están instalados
node --version        # >= 18.0.0
npm --version         # >= 9.0.0
git --version         # >= 2.30.0

# Para infraestructura (opcional, solo si trabajas en AWS)
terraform --version   # >= 1.0
aws --version         # >= 2.13.0

# Para desarrollo móvil iOS (si tienes Mac)
xcode-select --print-path

# Para desarrollo móvil Android
echo $ANDROID_SDK_ROOT
```

## 🚀 Setup (primera vez)

### Paso 1: Clonar y Navegar
```bash
git clone https://github.com/tu-org/panini-app.git
cd panini-app
```

### Paso 2: Crear Rama de Trabajo
```bash
git checkout -b feature/tu-nombre-feature
```

### Paso 3: Instalar Dependencias
```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend-web && npm install && cd ..

# Mobile
cd mobile-app && npm install && cd www && npm install && cd ../..
```

### Paso 4: Configurar Variables de Entorno
```bash
# Copiar archivos de ejemplo
cp backend/.env.example backend/.env
cp frontend-web/.env.example frontend-web/.env
cp mobile-app/.env.example mobile-app/.env

# Editar los archivos .env con tus valores
# Para desarrollo local, los valores por defecto generalmente funcionan
```

### Paso 5: Iniciar Base de Datos (Docker)
```bash
# PostgreSQL
docker run -d \
  --name panini-postgres \
  -e POSTGRES_PASSWORD=postgres_dev_password \
  -e POSTGRES_DB=panini \
  -p 5432:5432 \
  postgres:14

# Redis
docker run -d \
  --name panini-redis \
  -p 6379:6379 \
  redis:7

# Verificar que están corriendo
docker ps
```

### Paso 6: Ejecutar Migrations
```bash
cd backend
npm run migrate
cd ..
```

### Paso 7: Iniciar Servidores (3 terminales)

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# Esperarás: "Server running on http://localhost:3000"
```

**Terminal 2: Frontend**
```bash
cd frontend-web
npm run dev
# Esperarás: "Local: http://localhost:5173"
```

**Terminal 3: Mobile Web**
```bash
cd mobile-app/www
npm run dev
# Esperarás: "Local: http://localhost:5174"
```

## ✅ Verificar Setup

- [ ] Backend API responde: `curl http://localhost:3000/health`
- [ ] Frontend carga: http://localhost:5173
- [ ] Mobile web carga: http://localhost:5174
- [ ] Base de datos conectada: Check backend logs
- [ ] Cache Redis funcionando: Check backend logs

## 📝 Flujo de Trabajo

### 1. Asignar Tarea
- Ir a [GitHub Issues](https://github.com/tu-org/panini-app/issues)
- Buscar issue sin asignar
- Comment: "Me asigno esta tarea" / "I'll work on this"

### 2. Crear Feature Branch
```bash
git checkout -b feature/nombre-descriptivo

# Ejemplos:
# feature/agregar-ocr-backend
# feature/mejorar-tabla-faltantes
# bugfix/corregir-login-facebook
```

### 3. Hacer Cambios
```bash
# Editar archivos

# Verificar que compila
cd backend && npm run build && cd ..

# Ejecutar linter
cd backend && npm run lint && cd ..

# Ejecutar tests (si existen)
cd backend && npm run test && cd ..
```

### 4. Commit con Mensaje Descriptivo
```bash
# Ver qué cambió
git status
git diff

# Agregar cambios
git add .

# Commit con formato convencional
git commit -m "feat(backend): agregar endpoint POST /api/scans para OCR"

# Ejemplos de prefijos:
# feat:     nueva feature
# fix:      corrección de bug
# docs:     cambios en documentación
# style:    formateo, sin cambios funcionales
# refactor: refactorización sin cambios funcionales
# test:     agregar tests
# chore:    cambios en configuración
```

### 5. Push a Rama
```bash
git push origin feature/nombre-descriptivo
```

### 6. Crear Pull Request
- Ir a GitHub → Pull Requests → New Pull Request
- Escribir descripción clara de cambios
- Linkear issue: "Fixes #123"
- Solicitar review

### 7. Code Review
- Esperar aprobación de 1+ desarrolladores
- Dirección: "I'm ready for review"
- Responder comentarios del reviewer

### 8. Merge
- Cuando esté aprobado, merge a main
- GitHub Actions corre tests automáticamente
- Verificar que todo está verde ✓

## 🐛 Debugging Common Issues

### ❌ "Cannot find module 'express'"
```bash
# Olvidaste instalar dependencias
cd backend
npm install
```

### ❌ "Port 3000 already in use"
```bash
# Algo más está usando puerto 3000
# Opción 1: Matarlo
lsof -ti:3000 | xargs kill -9

# Opción 2: Usar puerto diferente
PORT=3001 npm run dev
```

### ❌ "Database connection refused"
```bash
# PostgreSQL no está corriendo
# Verificar
docker ps

# Si no está, iniciarlo
docker run -d --name panini-postgres -e POSTGRES_PASSWORD=postgres_dev_password -e POSTGRES_DB=panini -p 5432:5432 postgres:14
```

### ❌ "EADDRINUSE: address already in use :::5173"
```bash
# Algo está usando puerto 5173
lsof -ti:5173 | xargs kill -9

# O usar puerto diferente
npm run dev -- --port 5175
```

### ❌ TypeScript compilation errors
```bash
# Verificar tipos
cd backend
npx tsc --noEmit

# Ver error detallado y corregir
```

## 📚 Documentación Importante

| Documento | Propósito |
|-----------|----------|
| [PLAN.md](./PLAN.md) | Plan general del proyecto |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura técnica |
| [AWS_SETUP.md](./docs/AWS_SETUP.md) | Configurar AWS |
| [APP_STORE_DEPLOYMENT.md](./docs/APP_STORE_DEPLOYMENT.md) | Deploy en tiendas |

## 🔗 Links Útiles

- [GitHub Repository](https://github.com/tu-org/panini-app)
- [GitHub Issues](https://github.com/tu-org/panini-app/issues)
- [Backend API Docs](http://localhost:3000/api-docs) (cuando esté deployado)
- [Slack Channel](https://slack.com/app_redirect?channel=panini-app-dev)

## 💡 Consejos

1. **Commits pequeños**: Mejor 3 commits pequeños que 1 grande
2. **Ramas cortas**: Mantén tu rama < 1 semana de trabajo
3. **Prueba localmente**: Siempre prueba antes de push
4. **Lee tests existentes**: Aprenderás cómo escribir los tuyos
5. **Preguntar**: No dudes en preguntar en Slack si tienes dudas

## 🎓 Próximos Pasos

### Si trabajas en Backend:
- [ ] Leer [backend/README.md](./backend/README.md)
- [ ] Familiarizarse con API routes
- [ ] Entender modelos de datos
- [ ] Revisar tests existentes

### Si trabajas en Frontend:
- [ ] Leer [frontend-web/README.md](./frontend-web/README.md)
- [ ] Entender Redux structure
- [ ] Revisar componentes existentes
- [ ] Entender API integration

### Si trabajas en Mobile:
- [ ] Leer [mobile-app/README.md](./mobile-app/README.md)
- [ ] Setup Xcode o Android Studio
- [ ] Entender WebView bridge
- [ ] Setup iOS/Android emulators

### Si trabajas en Infraestructura:
- [ ] Leer [infrastructure/README.md](./infrastructure/README.md)
- [ ] Entender Terraform files
- [ ] Setup AWS CLI
- [ ] Familiarizarse con AWS console

## 📞 Necesitas Ayuda?

1. **Revisar docs**: Primero busca en la documentación
2. **Buscar GitHub Issues**: Alguien más probablemente tuvo el mismo problema
3. **Slack #panini-app-dev**: Pregunta a los desarrolladores
4. **Code review**: Los revisadores responderán comentarios

---

**¡Bienvenido al equipo! 🎉**

Cualquier pregunta, no dudes en contactar. ¡Feliz coding!
