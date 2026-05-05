# Panini App - Monorepo Structure

## Estructura de Repositorios

```
panini-app/                                 # Monorepo principal
├── .github/
│   ├── workflows/
│   │   ├── backend-deploy.yml
│   │   ├── frontend-deploy.yml
│   │   └── mobile-deploy.yml
│   ├── CODEOWNERS
│   └── ISSUE_TEMPLATE/
├── .gitignore
├── .env.example
├── .editorconfig
├── README.md
├── CONTRIBUTING.md
├── PLAN.md                                 # Este documento
│
├── docs/                                   # Documentación
│   ├── ARCHITECTURE.md
│   ├── AWS_SETUP.md
│   ├── APP_STORE_DEPLOYMENT.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   └── DEPLOYMENT_GUIDE.md
│
├── backend/                                # API Node.js/Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   ├── aws.ts
│   │   │   └── env.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── usersController.ts
│   │   │   ├── figuritasController.ts
│   │   │   └── scanController.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Figurita.ts
│   │   │   └── UserFigurita.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── figuritas.ts
│   │   │   └── scans.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── ocrService.ts
│   │   │   ├── s3Service.ts
│   │   │   └── emailService.ts
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── logger.ts
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   └── app.ts
│   ├── .env.example
│   ├── .env.dev
│   ├── .env.prod
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── jest.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── frontend-web/                           # React Web App
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Tablero.tsx
│   │   │   ├── Faltantes.tsx
│   │   │   ├── Perfil.tsx
│   │   │   └── Login.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── FiguitaCard.tsx
│   │   │   ├── Table.tsx
│   │   │   └── common/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useFiguritas.ts
│   │   │   └── useApi.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── redux/
│   │   │   ├── store.ts
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   └── figuritasSlice.ts
│   │   │   └── hooks.ts
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── variables.css
│   │   ├── utils/
│   │   │   └── helpers.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── mobile-app/                             # Aplicación Hybrid
│   ├── ios/
│   │   ├── PaniApp/
│   │   │   ├── AppDelegate.swift
│   │   │   ├── WebViewController.swift
│   │   │   ├── CameraManager.swift
│   │   │   ├── OAuthManager.swift
│   │   │   └── LocalStorage.swift
│   │   ├── PaniApp.xcodeproj/
│   │   ├── Podfile
│   │   └── README.md
│   ├── android/
│   │   ├── app/src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── MainActivity.kt
│   │   │   ├── CameraActivity.kt
│   │   │   ├── OAuthManager.kt
│   │   │   └── LocalStorage.kt
│   │   ├── app/build.gradle
│   │   ├── build.gradle
│   │   ├── settings.gradle
│   │   └── README.md
│   ├── www/                                # React app embebida
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── redux/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   └── README.md
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── infrastructure/                         # IaC - Terraform
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── vpc.tf
    ├── rds.tf
    ├── redis.tf
    ├── ecs.tf
    ├── s3.tf
    ├── cloudfront.tf
    ├── iam.tf
    ├── monitoring.tf
    ├── environments/
    │   ├── dev.tfvars
    │   ├── staging.tfvars
    │   └── prod.tfvars
    ├── .terraform/
    ├── .gitignore
    ├── README.md
    └── Makefile
```

---

## Comandos Principales

### Backend
```bash
cd backend

# Development
npm run dev

# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Migrate database
npm run migrate

# Start production
npm start
```

### Frontend Web
```bash
cd frontend-web

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

### Mobile App
```bash
cd mobile-app

# Install dependencies
npm install

# Web part development
cd www && npm run dev

# iOS development (Mac required)
cd ios && open PaniApp.xcodeproj

# Android development (Android Studio)
cd android
# Abrir en Android Studio

# Build iOS
cd ios && xcodebuild -workspace PaniApp.xcworkspace -scheme PaniApp -configuration Release

# Build Android
cd android && ./gradlew bundleRelease
```

### Infrastructure
```bash
cd infrastructure

# Init terraform
terraform init

# Plan changes
terraform plan -var-file="environments/dev.tfvars"

# Apply changes
terraform apply -var-file="environments/dev.tfvars"

# Destroy resources
terraform destroy -var-file="environments/dev.tfvars"
```

---

## Flujos de Trabajo Recomendados

### 1. Setup Inicial del Proyecto

```bash
# Clonar monorepo
git clone https://github.com/tu-org/panini-app.git
cd panini-app

# Instalar dependencias de todas las partes
cd backend && npm install
cd ../frontend-web && npm install
cd ../mobile-app && npm install && cd www && npm install
cd ../infrastructure && terraform init

# Crear archivos .env
cp backend/.env.example backend/.env.dev
cp frontend-web/.env.example frontend-web/.env
cp mobile-app/.env.example mobile-app/.env
```

### 2. Development Local

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend Web
cd frontend-web
npm run dev

# Terminal 3: Mobile app web part
cd mobile-app/www
npm run dev

# Para testing mobile:
# Terminal 4: Mobile iOS (Mac)
cd mobile-app/ios
open PaniApp.xcodeproj

# O Mobile Android
cd mobile-app/android
# Abrir en Android Studio
```

### 3. Feature Branch Workflow

```bash
# Crear feature branch
git checkout -b feature/agregar-ocr

# Hacer cambios en backend, frontend, etc
# Commit frecuentes
git add .
git commit -m "feat: implementar OCR básico"

# Push
git push origin feature/agregar-ocr

# Abrir Pull Request
# GitHub Actions corre tests automáticamente
# Code review y merge a main
```

### 4. Deployment a Staging

```bash
# Main branch trigger automático
git push origin main

# GitHub Actions:
# 1. Lint y tests
# 2. Build backend → ECR
# 3. Build frontend → S3
# 4. Deploy a ECS staging
# 5. Smoke tests

# Verificar en:
# - https://staging-api.panini-app.com
# - https://staging.panini-app.com
```

### 5. Deployment a Production

```bash
# Crear release tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# GitHub Actions:
# 1. Todos los tests
# 2. Security scanning
# 3. Build de todas las partes
# 4. Manual approval requerido
# 5. Deploy a production
# 6. Smoke tests
# 7. Notification al team

# Publicar en app stores
# Requiere interacción manual en Google Play y App Store Connect
```

---

## Roadmap Inicial (8 semanas)

### Semana 1-2: Setup & Infrastructure
- [ ] Crear repositorios Git
- [ ] Configurar AWS account y servicios
- [ ] Setup CI/CD pipelines
- [ ] Database migrations base

### Semana 2-4: Backend API
- [ ] OAuth integration
- [ ] User management
- [ ] Figuritas CRUD
- [ ] Scans & OCR
- [ ] API documentation

### Semana 3-4: Frontend Web
- [ ] Setup React + Redux
- [ ] Login page
- [ ] Dashboard
- [ ] Figuritas grid
- [ ] Missing figuritas table

### Semana 4-6: Mobile App
- [ ] Hybrid app setup
- [ ] WebView configuration
- [ ] Native bridge (camera, storage)
- [ ] OAuth implementation
- [ ] Offline sync

### Semana 6-7: Testing & QA
- [ ] E2E tests
- [ ] Performance testing
- [ ] Security audit
- [ ] Bug fixes

### Semana 7: DevOps
- [ ] Staging deployment
- [ ] Production ready
- [ ] Monitoring setup
- [ ] Disaster recovery

### Semana 8: App Store Launch
- [ ] Google Play submission
- [ ] Apple App Store submission
- [ ] Beta testing
- [ ] Release management

---

## Convenciones del Proyecto

### Git Commit Messages
```
feat(backend): agregar endpoint OCR
fix(mobile): resolver crash en camera
docs: actualizar guía de deployment
style(frontend): mejorar spacing en cards
test(backend): agregar tests para auth
chore: actualizar dependencies
```

### Branch Naming
```
feature/nombre-feature
bugfix/nombre-bug
hotfix/nombre-hotfix
refactor/nombre-refactor
docs/nombre-doc
```

### Código Standards
- **Backend**: TypeScript, ESLint, Prettier
- **Frontend**: TypeScript, ESLint, Prettier
- **Mobile**: Swift (iOS), Kotlin (Android)
- **Infrastructure**: Terraform best practices

### PR Process
1. Crear feature branch
2. Commit con mensajes claros
3. Push y crear PR
4. Code review mínimo 1 persona
5. GitHub Actions deben pasar
6. Merge a main

---

## Recursos Útiles

- [AWS Documentation](https://docs.aws.amazon.com)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)
- [React Native Docs](https://reactnative.dev)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)

---

## Support & Contact

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Email: dev@panini-app.com
- Slack: #panini-app-dev
