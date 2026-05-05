# 🎌 Panini Figuritas App

Aplicación móvil híbrida (iOS/Android) y web para coleccionar figuritas del álbum de Panini del Mundial de Fútbol.

## 📋 Visión General

Panini Figuritas es una plataforma integral que permite a los usuarios:

- 📸 **Capturar figuritas** mediante cámara o ingreso manual del número
- 🎯 **Registrar su colección** en tiempo real
- 📊 **Ver estadísticas** de su colección
- 🔄 **Sincronizar** datos en la nube
- 👥 **Autenticarse** con Facebook, Instagram o TikTok
- 📝 **Ver todas las figuritas faltantes** en una tabla completa

## 🏗️ Arquitectura

### Tech Stack

**Backend**
- Node.js + Express.js (TypeScript)
- PostgreSQL (Aurora)
- Redis (ElastiCache)
- AWS S3 (almacenamiento)

**Frontend**
- React 18 + TypeScript
- Redux Toolkit
- Vite
- Responsive Design

**Mobile**
- Hybrid (WebView)
- Swift (iOS) + Kotlin (Android)
- React para la app web embebida
- Native bridges para cámara y OAuth

**Infrastructure**
- AWS (VPC, RDS, ECS, Fargate, CloudFront)
- Terraform (Infrastructure as Code)
- GitHub Actions (CI/CD)

## 📁 Estructura del Proyecto

```
panini-app/
├── backend/              # API Node.js/Express
├── frontend-web/         # React web app
├── mobile-app/
│   ├── ios/             # Swift (iOS nativo)
│   ├── android/         # Kotlin (Android nativo)
│   └── www/             # React web app embebida
├── infrastructure/      # Terraform (AWS)
├── docs/                # Documentación
└── .github/workflows/   # CI/CD pipelines
```

## 🚀 Quick Start

### Requisitos Previos

- Node.js 18+
- npm o yarn
- PostgreSQL 14+ (o Docker)
- Redis 7+ (o Docker)
- AWS Account (para deployment)

### Setup Local

#### 1. Clonar repositorio
```bash
git clone https://github.com/tu-org/panini-app.git
cd panini-app
```

#### 2. Instalar dependencias
```bash
# Backend
cd backend
npm install

# Frontend Web
cd ../frontend-web
npm install

# Mobile App
cd ../mobile-app
npm install
cd www && npm install
```

#### 3. Configurar variables de entorno
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# Frontend
cp frontend-web/.env.example frontend-web/.env

# Mobile
cp mobile-app/.env.example mobile-app/.env
```

#### 4. Configurar Base de Datos (Docker)
```bash
# Terminal 1: PostgreSQL
docker run -d \
  --name panini-postgres \
  -e POSTGRES_PASSWORD=postgres_dev_password \
  -e POSTGRES_DB=panini \
  -p 5432:5432 \
  postgres:14

# Terminal 2: Redis
docker run -d \
  --name panini-redis \
  -p 6379:6379 \
  redis:7
```

#### 5. Ejecutar migrations
```bash
cd backend
npm run migrate
```

#### 6. Iniciar desarrollo
```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend Web
cd frontend-web
npm run dev

# Terminal 3: Mobile App (Web part)
cd mobile-app/www
npm run dev

# Acceder a:
# - Backend: http://localhost:3000
# - Frontend: http://localhost:5173
# - Mobile Web: http://localhost:5174
```

## 📚 Documentación

- [PLAN.md](./PLAN.md) - Plan completo de desarrollo
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura detallada
- [AWS_SETUP.md](./docs/AWS_SETUP.md) - Configuración de AWS con Terraform
- [APP_STORE_DEPLOYMENT.md](./docs/APP_STORE_DEPLOYMENT.md) - Deploy en Play Store y App Store
- [WORKSPACE_STRUCTURE.md](./WORKSPACE_STRUCTURE.md) - Estructura del workspace

## 🔧 Desarrollo

### Comandos Principales

**Backend**
```bash
cd backend

npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build para producción
npm run start        # Iniciar servidor producción
npm run test         # Ejecutar tests
npm run lint         # Linter
npm run migrate      # Ejecutar migrations
```

**Frontend Web**
```bash
cd frontend-web

npm run dev          # Iniciar dev server
npm run build        # Build para producción
npm run preview      # Previsualizar build
npm run lint         # Linter
npm run test         # Tests
```

**Mobile App**
```bash
cd mobile-app

# Web part
cd www && npm run dev

# iOS (requiere Mac)
cd ios
open PaniApp.xcodeproj

# Android
cd android
# Abrir en Android Studio
```

### Convenciones de Código

- **Language**: TypeScript (strict mode)
- **Formatting**: Prettier
- **Linting**: ESLint
- **Commits**: Conventional Commits
- **Branches**: feature/*, bugfix/*, hotfix/*

### Pull Request Process

1. Fork el repositorio
2. Crear feature branch (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'feat: descripción'`)
4. Push a branch (`git push origin feature/nueva-feature`)
5. Abrir Pull Request
6. Esperar code review y tests pasen
7. Merge a main

## 🌐 Deployment

### Staging (Automático)
```bash
git push origin main
# GitHub Actions: Build → Test → Deploy a Staging
```

### Production (Manual)
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# GitHub Actions: Build → Test → Manual Approval → Deploy
```

### App Stores

#### Google Play Store
```bash
cd mobile-app/android
./gradlew bundleRelease

# Subirlo en Google Play Console
# Revisar documentación en docs/APP_STORE_DEPLOYMENT.md
```

#### Apple App Store
```bash
cd mobile-app/ios
xcodebuild -workspace PaniApp.xcworkspace \
  -scheme PaniApp \
  -configuration Release \
  -archivePath ./PaniApp.xcarchive \
  archive

# Subirlo en App Store Connect
# Revisar documentación en docs/APP_STORE_DEPLOYMENT.md
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm run test

# Frontend tests
cd frontend-web && npm run test

# E2E tests (cuando estén configurados)
npm run test:e2e
```

## 📊 Monitoreo

### Desarrollo
- CloudWatch Logs en AWS Console
- Local: stdout/stderr

### Producción
- AWS CloudWatch Dashboard
- Alertas vía SNS/Email
- X-Ray para tracing distribuido

## 🔐 Seguridad

### OAuth
- Facebook, Instagram, TikTok OAuth2
- PKCE flow para apps móviles
- JWT tokens con expiry

### Base de Datos
- Encrypted at rest (RDS, S3)
- Encrypted in transit (TLS 1.3)
- SQL injection protection
- Prepared statements

### API
- Rate limiting
- CORS configuration
- Input validation
- API key rotation

## 📈 Roadmap

### MVP (Semana 8)
- [x] Setup base e infraestructura
- [ ] Backend API completa
- [ ] Frontend web
- [ ] Mobile app hybrid
- [ ] Deploy a staging
- [ ] Submisión app stores

### Post-Launch
- [ ] Sistema de intercambios entre usuarios
- [ ] Tablero social con amigos
- [ ] Eventos y torneos
- [ ] Integración con otros álbumes
- [ ] AR preview de figuritas
- [ ] NFT marketplace

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una feature branch
3. Commit cambios
4. Push a branch
5. Abrir Pull Request

## 📞 Soporte

- Issues: [GitHub Issues](https://github.com/tu-org/panini-app/issues)
- Email: dev@panini-app.com
- Slack: #panini-app-dev

## 📄 Licencia

Este proyecto está bajo la licencia MIT - ver [LICENSE](./LICENSE) para detalles.

## 👨‍💻 Autores

- Panini Dev Team

---

**Última actualización**: Mayo 4, 2026

**Estado**: En Desarrollo 🚧
