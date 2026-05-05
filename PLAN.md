# Plan Completo - Aplicación Panini Figuritas

## Visión General
Aplicación móvil híbrida (iOS/Android) que permite a usuarios coleccionar figuritas del álbum de Panini del Mundial, registrando cuáles tienen, cuáles les faltan y duplicados.

## Stack Tecnológico

### Frontend
- **Mobile**: React Native (Expo) con WebView nativo
- **Web Admin**: React 18 + TypeScript + Vite
- **Networking**: Axios, React Query
- **UI**: React Native UI Kitten / React Native Paper

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de datos**: PostgreSQL (AWS RDS)
- **Cache**: Redis (AWS ElastiCache)
- **Storage**: AWS S3 (para fotos de figuritas)
- **Auth**: OAuth2 (Facebook, Instagram, TikTok)

### Infraestructura AWS
- **Compute**: ECS Fargate (API Backend)
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Storage**: S3
- **CDN**: CloudFront
- **Auth**: Cognito + OAuth
- **Monitoring**: CloudWatch, X-Ray
- **CI/CD**: GitHub Actions

---

## Fases de Desarrollo

### FASE 1: Setup Base & Infraestructura (Semanas 1-2)

#### 1.1 Configuración de Repositorios
- [ ] Backend API repository
- [ ] Frontend Web repository
- [ ] Mobile App repository
- [ ] Infrastructure as Code (Terraform)
- [ ] Shared utilities & types

#### 1.2 Infraestructura AWS
- [ ] VPC con subnets públicas/privadas
- [ ] RDS PostgreSQL (DEV/STAGING/PROD)
- [ ] ElastiCache Redis cluster
- [ ] S3 buckets (estáticos, media, backups)
- [ ] CloudFront distribution
- [ ] IAM roles y políticas
- [ ] Secrets Manager para credenciales

#### 1.3 CI/CD Pipeline
- [ ] GitHub Actions workflows
- [ ] Build para backend
- [ ] Build para frontend web
- [ ] Build para iOS/Android
- [ ] Auto-deploy a staging

---

### FASE 2: Backend API (Semanas 2-4)

#### 2.1 Autenticación & Usuarios
- [ ] OAuth2 integration (Facebook, Instagram, TikTok)
- [ ] JWT tokens
- [ ] Refresh token mechanism
- [ ] User profile management
- [ ] Session management

#### 2.2 Modelos de Datos
```
Users
├── id, email, username
├── provider (facebook/instagram/tiktok)
├── profile_picture, created_at

Figuritas (Catálogo)
├── id, number (1-640)
├── name, description
├── image_url
├── rarity (common/rare/special)
├── year (2022, 2026, etc)

UserFiguritas (Colección del Usuario)
├── user_id, figurita_id
├── quantity (copias que tiene)
├── added_at, last_updated

FiguitaScans (OCR & Photos)
├── id, user_id, figurita_id
├── photo_url (S3)
├── confidence_score
├── processed_at
```

#### 2.3 API Endpoints
```
AUTH
  POST   /api/auth/login
  POST   /api/auth/login/:provider
  POST   /api/auth/refresh
  POST   /api/auth/logout

USERS
  GET    /api/users/me
  PUT    /api/users/me
  DELETE /api/users/me

FIGURITAS (Catálogo)
  GET    /api/figuritas
  GET    /api/figuritas/:id
  GET    /api/figuritas/search?query=

USER COLLECTION
  GET    /api/users/me/figuritas
  POST   /api/users/me/figuritas
  PUT    /api/users/me/figuritas/:id
  DELETE /api/users/me/figuritas/:id

MISSING/STATS
  GET    /api/users/me/missing
  GET    /api/users/me/stats
  GET    /api/users/me/duplicates

SCAN & OCR
  POST   /api/scan/image (upload + OCR)
  POST   /api/scan/number (input manual)
  GET    /api/scan/history
```

#### 2.4 Funcionalidades
- [ ] Validación JWT middleware
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Error handling centralizado
- [ ] Logging y monitoring
- [ ] API Documentation (Swagger/OpenAPI)
- [ ] Database migrations (Sequelize/Knex)

---

### FASE 3: Frontend Web Admin (Semanas 3-4)

#### 3.1 Páginas Principales
- [ ] Dashboard (stats, missing figuritas)
- [ ] Tablero de figuritas (grid interactivo)
- [ ] Detalles de figurita
- [ ] Perfil de usuario
- [ ] Configuración

#### 3.2 Funcionalidades
- [ ] Login con providers OAuth
- [ ] Carga manual de figuritas
- [ ] Búsqueda y filtrado
- [ ] Vista de faltantes (tabla completa)
- [ ] Exportar datos (CSV)
- [ ] Responsive design (mobile-friendly)

---

### FASE 4: Aplicación Mobile (Semanas 4-6)

#### 4.1 Arquitectura Hybrid
```
├── iOS (Swift + WebView)
├── Android (Kotlin + WebView)
└── www/ (React app embebida)
    ├── Camera integration (nativo)
    ├── OCR processing (local o cloud)
    ├── OAuth SSO (nativo)
```

#### 4.2 Componentes Nativos (mínimos)
- [ ] Camera access y captura
- [ ] Gallery access
- [ ] OAuth login flows
- [ ] Local storage
- [ ] Push notifications
- [ ] Device info

#### 4.3 WebView App
- [ ] React SPA optimizada para mobile
- [ ] Redux/Zustand para estado global
- [ ] PWA capabilities
- [ ] Offline support (ServiceWorker)
- [ ] Local indexedDB/SQLite para caché

#### 4.4 Features
- [ ] Capturar foto de figurita
- [ ] OCR del número de figurita (Cloud Vision o Tesseract)
- [ ] Input manual del número
- [ ] Mostrar tablero de colección
- [ ] Mostrar faltantes (tablas/grid)
- [ ] Sincronización con backend
- [ ] Push notifications

---

### FASE 5: Testing & QA (Semana 6-7)

#### 5.1 Backend Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] API load testing (k6)
- [ ] Security testing (OWASP)

#### 5.2 Frontend Testing
- [ ] Unit tests
- [ ] Component tests
- [ ] E2E tests (Playwright/Cypress)
- [ ] Performance testing

#### 5.3 Mobile Testing
- [ ] iOS testing device
- [ ] Android testing device
- [ ] Camera & OCR validation
- [ ] Offline mode testing
- [ ] Memory/Battery usage

---

### FASE 6: DevOps & Deployment (Semana 7)

#### 6.1 Staging Deployment
- [ ] Backend a ECS Fargate
- [ ] Frontend a S3 + CloudFront
- [ ] Database setup
- [ ] SSL certificates (ACM)
- [ ] Monitoring/Alerts (CloudWatch)

#### 6.2 Production Setup
- [ ] Multi-region setup (opcional)
- [ ] Auto-scaling policies
- [ ] Disaster recovery plan
- [ ] Backup strategy
- [ ] Log aggregation

---

### FASE 7: App Store Deployment (Semana 7-8)

#### 7.1 Google Play Store
- [ ] Crear cuenta developer ($25 único)
- [ ] Preparar APK/AAB
- [ ] Screenshots & descripción
- [ ] App store optimization
- [ ] Beta testing (Google Play Beta)
- [ ] Release gradual (10% → 50% → 100%)

#### 7.2 Apple App Store
- [ ] Crear cuenta developer ($99/año)
- [ ] Certificados & provisioning profiles
- [ ] Preparar IPA
- [ ] TestFlight beta testing
- [ ] App review process
- [ ] Release management

---

## Requisitos por Componente

### Backend
```
Node.js 18+
Express.js 4.x
PostgreSQL 14+
Redis 7+
AWS CLI
Docker
Swagger/OpenAPI
```

### Frontend Web
```
Node.js 18+
React 18
TypeScript
Vite
Redux/Zustand
Axios
```

### Mobile
```
Expo CLI
React Native
iOS SDK (Xcode 14+)
Android SDK (API 24+)
Cocoapods
Gradle
```

### Infrastructure
```
Terraform 1.0+
AWS CLI
Docker
GitHub CLI
```

---

## Presupuesto Estimado (AWS Monthly)

- RDS PostgreSQL: $50-100
- ElastiCache Redis: $30-50
- ECS Fargate: $100-200
- S3: $10-30
- CloudFront: $20-50
- Cognito: $5-10 (por MAU)
- **Total**: ~$200-400/mes en desarrollo

Production: $500-1000/mes

---

## Cronograma
- **Semana 1-2**: Infraestructura & Setup
- **Semana 2-4**: Backend API
- **Semana 3-4**: Frontend Web
- **Semana 4-6**: Mobile App
- **Semana 6-7**: Testing & QA
- **Semana 7**: DevOps & Staging
- **Semana 8**: App Store Deploy

**Tiempo total estimado**: 8 semanas para MVP

---

## Post-Launch

### Roadmap Futuro
- [ ] Sistema de intercambio de figuritas entre usuarios
- [ ] Tablero con amigos
- [ ] Eventos/torneos
- [ ] Integración con otros álbumes (Pokemon, Fútbol, etc)
- [ ] Web3/NFT integration
- [ ] AR preview de figuritas

### Métricas a Monitorear
- DAU (Daily Active Users)
- Retention rate
- API response time
- Error rates
- User acquisition cost
- LTV (Life Time Value)
