# Arquitectura de Panini App

## Diagrama General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet / Users                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────┐          ┌────────┐          ┌─────────┐
    │  iOS   │          │Android │          │Web App  │
    │  App   │          │  App   │          │(React)  │
    │(Hybrid)│          │(Hybrid)│          │         │
    └───┬────┘          └───┬────┘          └────┬────┘
        │                   │                     │
        └───────────────────┼─────────────────────┘
                            │
                     ┌──────▼──────┐
                     │ CloudFront  │ (CDN)
                     │   + WAF     │
                     └──────┬──────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌────────────┐  ┌──────────────┐  ┌──────────┐
    │ S3 Static  │  │ ALB (Load    │  │ Route53  │
    │ Content    │  │ Balancer)    │  │ (DNS)    │
    │ (Web App)  │  │              │  │          │
    └────────────┘  └──────┬───────┘  └──────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
    ┌────────────────────┐          ┌───────────────┐
    │  ECS Fargate       │          │  ECR          │
    │  (API Backend)     │◄─────────│  (Images)     │
    │  - 2+ tasks        │          │               │
    │  - Auto-scaling    │          └───────────────┘
    └────┬───────────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    │          │            │            │
    ▼          ▼            ▼            ▼
┌──────┐  ┌────────────┐ ┌──────────┐ ┌──────┐
│RDS   │  │ElastiCache │ │IAM Role  │ │Sec.  │
│PostgSQL  │ Redis     │ │          │ │Manager
│ (DB) │  │  (Cache)  │ │          │ │(Creds)
└──────┘  └────────────┘ └──────────┘ └──────┘
```

## Componentes Detallados

### 1. Frontend Mobile (iOS/Android)

#### Estructura
```
mobile-app/
├── ios/                    # Código nativo Swift
│   ├── PaniApp/
│   │   ├── AppDelegate.swift
│   │   ├── WebViewController.swift  # WebView controller
│   │   ├── CameraManager.swift
│   │   ├── OAuthManager.swift
│   │   └── LocalStorage.swift
│   └── Podfile
├── android/                # Código nativo Kotlin
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── MainActivity.kt     # WebView activity
│   │   │   ├── CameraActivity.kt
│   │   │   ├── OAuthManager.kt
│   │   │   └── LocalStorage.kt
│   └── build.gradle
└── www/                    # React app embebida
    ├── src/
    │   ├── screens/
    │   ├── components/
    │   ├── services/  (API calls)
    │   ├── hooks/
    │   ├── redux/  (State management)
    │   └── App.tsx
    └── package.json
```

#### Flujo de Interacción
1. App nativa abre WebView
2. WebView carga React app (desde S3 o local bundle)
3. Usuario interactúa con UI React
4. React llama APIs nativas (camera, OAuth) vía bridge
5. APIs nativas ejecutan funciones
6. Resultados vuelven a React
7. React sincroniza con backend AWS

#### Capacidades Nativas (Ponte JS ↔ Nativo)
```typescript
// JavaScript/React
navigator.camera.getPicture() → iOS/Android camera
window.oauth.login('facebook') → OAuth flow nativo
window.localStorage.setItem() → Keychain/SharedPreferences
```

### 2. Frontend Web (React + Vite)

```
frontend-web/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Tablero.tsx
│   │   ├── Faltantes.tsx
│   │   ├── Perfil.tsx
│   │   └── Login.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── FiguitaCard.tsx
│   │   ├── Table.tsx
│   │   └── etc
│   ├── hooks/
│   │   └── useAuth.ts, useFiguritas.ts
│   ├── services/
│   │   └── api.ts  (Axios config)
│   ├── redux/
│   │   ├── store.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   └── figuritasSlice.ts
│   └── App.tsx
└── vite.config.ts
```

### 3. Backend API (Express.js)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── aws.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── usersController.ts
│   │   ├── figuritasController.ts
│   │   └── scanController.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Figurita.ts
│   │   ├── UserFigurita.ts
│   │   └── Scan.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── figuritas.ts
│   │   └── scans.ts
│   ├── middleware/
│   │   ├── auth.ts  (JWT verification)
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── cors.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── ocrService.ts  (Cloud Vision o Tesseract)
│   │   ├── s3Service.ts
│   │   └── emailService.ts
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── app.ts  (Express app)
├── Dockerfile
└── package.json
```

#### Base de Datos (PostgreSQL)

```sql
-- Schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL, -- facebook, instagram, tiktok
  provider_id VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE figuritas (
  id SERIAL PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  rareza VARCHAR(50), -- common, rare, special
  anio INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_figuritas (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  figurita_id INT REFERENCES figuritas(id),
  cantidad INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, figurita_id)
);

CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  figurita_id INT REFERENCES figuritas(id),
  foto_url TEXT, -- S3 URL
  confidence_score FLOAT,
  tipo VARCHAR(50), -- 'camera' o 'manual'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_user_figuritas_user ON user_figuritas(user_id);
CREATE INDEX idx_scans_user ON scans(user_id);
CREATE INDEX idx_figuritas_numero ON figuritas(numero);
```

### 4. Infraestructura AWS (Terraform)

```
infrastructure/
├── main.tf                 # Provider y resources
├── variables.tf            # Input variables
├── outputs.tf             # Output values
├── vpc.tf                 # VPC, subnets, security groups
├── rds.tf                 # PostgreSQL database
├── redis.tf               # ElastiCache
├── ecs.tf                 # Fargate + ALB
├── s3.tf                  # S3 buckets
├── cloudfront.tf          # CDN
├── iam.tf                 # Roles y políticas
├── cognito.tf             # Auth
├── monitoring.tf          # CloudWatch
├── terraform.tfvars       # Variable values
└── environments/
    ├── dev.tfvars
    ├── staging.tfvars
    └── prod.tfvars
```

### 5. CI/CD Pipeline (GitHub Actions)

```yaml
Triggers:
  - Push a main/staging
  - Pull requests
  - Manual dispatch

Jobs:
  1. Lint & Test
     - Backend: ESLint, Jest
     - Frontend: ESLint, Jest
     - Mobile: lint checks
  
  2. Build
     - Backend → Docker image → ECR
     - Frontend → Static files → S3
     - Mobile → APK/AAB + IPA
  
  3. Deploy
     - Staging: Auto-deploy
     - Production: Manual approval
     - Mobile: Upload a stores
```

## Flujos de Datos

### Flujo de Registro de Figurita

```
1. Usuario abre app
   ↓
2. Captura foto CON CÁMARA (nativo)
   ↓
3. Envía foto a backend
   ↓
4. Backend ejecuta OCR (Google Cloud Vision)
   ↓
5. OCR devuelve número de figurita (ej: 234)
   ↓
6. Backend verifica en BD que figurita existe
   ↓
7. Backend actualiza user_figuritas (INSERT o UPDATE cantidad++)
   ↓
8. Backend devuelve confirmación
   ↓
9. Frontend muestra "✓ Figurita #234 agregada"
   ↓
10. React actualiza caché local + estado global
    ↓
11. UI se refresca mostrando nueva cantidad
```

### Flujo de Autenticación OAuth

```
1. Usuario clickea "Login con Facebook"
   ↓
2. App nativa abre OAuth flow (nativo, no webview)
   ↓
3. Usuario autoriza en Facebook
   ↓
4. Recibe código de autorización
   ↓
5. App envía código a backend
   ↓
6. Backend intercambia código por token (server-to-server)
   ↓
7. Backend obtiene perfil de usuario
   ↓
8. Backend crea/actualiza usuario en BD
   ↓
9. Backend genera JWT token
   ↓
10. Frontend almacena JWT localmente
    ↓
11. Todos los requests posteriores incluyen JWT header
```

### Flujo de Ver Faltantes

```
1. Usuario abre "Mis Faltantes"
   ↓
2. Frontend solicita /api/users/me/missing
   ↓
3. Backend:
   - Query: SELECT id FROM figuritas (todos)
   - Query: SELECT figurita_id FROM user_figuritas WHERE user_id = ?
   - Diferencia: faltantes = todos - tiene
   ↓
4. Backend devuelve array de figuritas faltantes
   ↓
5. Frontend carga datos en tabla/grid
   ↓
6. Usuario puede filtrar, buscar, ordenar
```

## Seguridad

### OAuth
- Facebook/Instagram/TikTok OAuth2 flow
- No almacenar passwords
- Usar PKCE para apps móviles
- Redirect URIs restrictivas

### JWT Tokens
- Access token: 15 minutos
- Refresh token: 7 días (almacenado en HttpOnly cookie)
- Signed con secret en AWS Secrets Manager

### API Security
- CORS restrictivo
- Rate limiting (Leaky bucket)
- Input validation con Joi/Zod
- SQL injection protection (Prepared statements)
- HTTPS everywhere (TLS 1.3)
- API key rotation

### AWS
- VPC endpoints for S3, RDS
- Security groups restrictivos
- Encryption at rest (RDS, S3)
- Encryption in transit (TLS)
- CloudTrail logging
- VPC Flow Logs

### Mobile
- Certificate pinning para HTTPS
- Keychain (iOS) / Keystore (Android) para tokens
- Obfuscación de código
- Jailbreak/Root detection

## Scaling

### Horizontal
- ECS Fargate auto-scaling (CPU/Memory metrics)
- RDS read replicas para reportes
- Redis cluster para cache distribuido
- CloudFront para static assets

### Vertical
- RDS instance type upgrade
- ElastiCache node type upgrade

### Optimizaciones
- Database indexing
- Redis caching for frequently accessed data
- CDN caching (1 day para assets)
- API response compression (gzip)
- Lazy loading en frontends

## Disaster Recovery

### RTO/RPO
- RTO (Recovery Time Objective): < 1 hora
- RPO (Recovery Point Objective): < 15 minutos

### Backups
- RDS automated backups (35 days)
- S3 versioning
- Cross-region replication (optional)

### Failover
- Multi-AZ for RDS
- ALB health checks
- Auto-recovery de tasks en ECS

## Monitoring & Observability

### Métricas
- CloudWatch dashboards
- API latency, error rates
- Database query performance
- Cache hit rates
- User sessions

### Logging
- Centralized logging con CloudWatch Logs
- Structured JSON logging
- Error aggregation
- Retention: 7 days dev, 30 days prod

### Alerting
- SNS para alerts críticas
- Slack integration
- PagerDuty para on-call

### Tracing
- AWS X-Ray para distributed tracing
- Performance bottleneck identification
