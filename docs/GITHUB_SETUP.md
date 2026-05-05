# GitHub Setup & Repositories

## 📋 Crear Repositorios en GitHub

### Opción 1: Monorepo (Recomendado)

Un único repositorio para todo el proyecto:

```bash
# 1. Crear repo en GitHub
# URL: https://github.com/tu-org/panini-app
# Descripción: "Panini Figuritas - Hybrid mobile app + web platform"
# Visibility: Private (o Public según políticas)

# 2. Clonar y pushear estructura actual
git clone https://github.com/tu-org/panini-app.git
cd panini-app

# 3. Agregar todos los archivos
git add .
git commit -m "feat: initial project structure and documentation"
git push -u origin main
```

### Opción 2: Múltiples Repositorios

Separar por componente (más flexible para scaling):

```
panini-backend         # Backend API
panini-frontend        # Frontend Web
panini-mobile          # Mobile App
panini-infrastructure  # Infrastructure as Code
panini-docs           # Documentación centralizada
```

**Recomendación**: Iniciar con **Opción 1 (Monorepo)** para facilitar sincronización entre componentes durante el desarrollo.

---

## 🔐 Configurar Protecciones de Branch

En GitHub → Settings → Branches → Branch protection rules

### Crear regla para `main`

```
Require status checks to pass before merging
├─ Require code reviews before merging (1+)
├─ Require review from code owners
├─ Require branches to be up to date before merging
├─ Require status checks to pass
│  ├─ Lint
│  ├─ Test
│  ├─ Build
│  └─ Security Scan
└─ Allow force pushes: ❌ NO
```

---

## 👥 Configurar CODEOWNERS

Archivo: `.github/CODEOWNERS`

```
# Backend
/backend/                    @backend-team
/backend/src/controllers/    @backend-team
/infrastructure/             @devops-team

# Frontend
/frontend-web/               @frontend-team
/mobile-app/                 @mobile-team

# Documentación
/docs/                       @tech-lead
*.md                         @tech-lead
```

---

## 🤖 GitHub Actions - Workflows

### 1. Lint & Test (Pull Request)

Archivo: `.github/workflows/test.yml`

```yaml
name: Test & Lint

on:
  pull_request:
    branches: [main, develop]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm run lint
      - run: cd backend && npm run test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend-web && npm install
      - run: cd frontend-web && npm run lint
      - run: cd frontend-web && npm run test

  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd mobile-app/www && npm install
      - run: cd mobile-app/www && npm run lint
```

### 2. Build & Deploy (Main)

Archivo: `.github/workflows/deploy.yml`

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install && npm run build
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker build -t panini-api:latest backend/
          docker tag panini-api:latest ${{ secrets.ECR_REGISTRY }}/panini-api:latest
          docker push ${{ secrets.ECR_REGISTRY }}/panini-api:latest

  deploy-staging:
    needs: build-backend
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: |
          aws ecs update-service \
            --cluster panini-cluster-staging \
            --service panini-api-service \
            --force-new-deployment
```

---

## 🔑 Configurar Secrets en GitHub

Settings → Secrets → Actions → New repository secret

### AWS Secrets
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
ECR_REGISTRY
```

### OAuth Secrets
```
FACEBOOK_APP_ID
FACEBOOK_APP_SECRET
INSTAGRAM_APP_ID
INSTAGRAM_APP_SECRET
TIKTOK_APP_ID
TIKTOK_APP_SECRET
```

### App Store Secrets
```
APPLE_ID
APP_SPECIFIC_PASSWORD
IOS_CERTIFICATE_P12
IOS_CERTIFICATE_PASSWORD
IOS_TEAM_ID
GOOGLE_PLAY_SERVICE_ACCOUNT
```

---

## 📝 Issue Templates

Archivo: `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Report a bug
title: "[BUG] Brief description"
labels: bug
---

## Description
<!-- Describe the bug clearly -->

## Steps to Reproduce
1.
2.
3.

## Expected Behavior
<!-- What should happen -->

## Actual Behavior
<!-- What actually happens -->

## Environment
- OS: 
- Node version: 
- Component: 

## Screenshots
<!-- Add screenshots if applicable -->
```

Archivo: `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest a feature
title: "[FEATURE] Brief description"
labels: enhancement
---

## Description
<!-- Describe the feature -->

## Use Case
<!-- Why do you need this? -->

## Possible Solution
<!-- How should it work? -->
```

---

## 🏷️ Labels Recomendados

```
bug              (ff0000) - Bug reports
enhancement      (84b6eb) - Feature requests
documentation    (0075ca) - Documentation
help wanted      (008672) - Help needed
good first issue (7057ff) - Good for newcomers
blocked          (d73a4a) - Blocked by something
in progress      (cccccc) - Currently being worked on
ready to merge    (0e8a16) - Ready to merge
wontfix          (ffffff) - Won't be fixed
```

---

## 👨‍💻 PR Process & Review

### Crear Pull Request

1. **Completar PR Template** (auto-populated)
2. **Linkear Issue**: `Fixes #123`
3. **Seleccionar Reviewer**: Min 1 person
4. **Seleccionar Assignee**: Persona que está haciendo el cambio
5. **Agregar Labels**: `backend`, `frontend`, `bug`, etc
6. **Esperar Checks**:
   - ✅ All checks must pass
   - ✅ Code review approval
   - ✅ Status checks passing

### Para Reviewers

- [ ] Código es comprensible
- [ ] Sigue estándares del proyecto
- [ ] Tests incluidos y pasando
- [ ] No hay duplicación de código
- [ ] Performance es aceptable
- [ ] Seguridad es adecuada
- [ ] Documentación actualizada

---

## 📊 GitHub Projects (Kanban)

Settings → Projects → New project

### Columnas
```
📋 Backlog
👀 Ready for Dev
🚀 In Progress
🔍 In Review
✅ Done
```

---

## 🔔 Notifications

GitHub Settings → Notifications

Recomendado:
```
✅ Participating
✅ Watching
❌ Automatic watching (off)
```

---

## Checklist Final

- [ ] Repositorio creado
- [ ] Main branch protegida
- [ ] CODEOWNERS configurado
- [ ] GitHub Actions workflows creados
- [ ] Secrets agregados
- [ ] Issue templates creados
- [ ] Labels creados
- [ ] Projects (Kanban) configurado
- [ ] Team miembros invitados
- [ ] Documentation linkeada desde README

---

## Links Útiles

- [GitHub Docs](https://docs.github.com)
- [GitHub Actions](https://github.com/features/actions)
- [GitHub CLI](https://cli.github.com/)
