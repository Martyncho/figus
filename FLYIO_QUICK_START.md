# Fly.io Quick Setup Guide

## 🚀 5-Minute Quick Start

### Prerequisites
```bash
# Install flyctl
# Windows: pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
# macOS: brew install flyctl
# Linux: curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login
```

### Setup (Automated)

**Windows (PowerShell):**
```powershell
.\setup-flyio.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x setup-flyio.sh
./setup-flyio.sh
```

The script will:
1. ✅ Create Fly.io app
2. ✅ Create PostgreSQL database
3. ✅ Configure environment variables
4. ✅ Deploy app
5. ✅ Show you the live URL

---

## 🔑 Manual Setup (If Script Fails)

### Step 1: Create App
```bash
flyctl app create pani
```

### Step 2: Create Database
```bash
flyctl postgres create \
  --name pani-db \
  --region sjc \
  --initial-cluster-size 1 \
  --volume-size 10 \
  --password-prompt

# Note: Save the DATABASE_URL shown
```

### Step 3: Attach Database
```bash
flyctl postgres attach pani-db \
  --app pani \
  --variable DATABASE_URL
```

### Step 4: Redis (Upstash)
- Go to https://upstash.com
- Create account → Create Redis DB (free tier)
- Copy the connection URL

### Step 5: Set Secrets
```bash
flyctl secrets set \
  JWT_SECRET="$(openssl rand -base64 32)" \
  REDIS_URL="your-upstash-url" \
  AWS_S3_BUCKET="pani-stickers" \
  CORS_ORIGIN="https://pani.fly.dev" \
  NODE_ENV="production"
```

Optional AWS:
```bash
flyctl secrets set \
  AWS_ACCESS_KEY_ID="your-key" \
  AWS_SECRET_ACCESS_KEY="your-secret"
```

### Step 6: Deploy
```bash
flyctl deploy --remote-only
```

### Step 7: Verify
```bash
flyctl status
flyctl logs -f
curl https://pani.fly.dev/health
```

---

## 🔄 Auto-Deploy Setup

### 1. Commit to GitHub
```bash
git add .
git commit -m "feat: fly.io deployment"
git push origin main
```

### 2. Get API Token
```bash
flyctl auth token
```
Copy the token

### 3. Add GitHub Secret
- Go to repo → Settings → Secrets and variables → Actions
- New secret: `FLY_API_TOKEN`
- Paste the token

### 4. Automatic Deploys
Now every push to `main` will auto-deploy!

```bash
# Development branch (no deploy)
git checkout -b feature/my-feature
git push origin feature/my-feature

# Production deploy (when merged to main)
git checkout main
git merge feature/my-feature
git push origin main
# GitHub Actions will automatically deploy!
```

---

## 📊 Monitoring

### Logs
```bash
flyctl logs -f              # Real-time
flyctl logs --lines 50      # Last 50 lines
flyctl logs | grep error    # Filter for errors
```

### Status
```bash
flyctl status               # Current status
flyctl metrics              # CPU, RAM, etc
flyctl monitor              # Watch in real-time
```

### Releases
```bash
flyctl releases             # Deployment history
flyctl releases -f          # Watch deployments
```

---

## 🔧 Common Commands

```bash
# Deploy specific version
flyctl deploy --image your-image-tag

# Scale instances
flyctl scale count 2                    # 2 replicas
flyctl scale vm shared-cpu-2x          # Bigger machine

# Update configuration
flyctl config show                      # Show current config
# Edit fly.toml, then:
flyctl deploy

# SSH into app
flyctl ssh console

# View/update secrets
flyctl secrets list
flyctl secrets set VAR=value
flyctl secrets unset VAR

# Database
flyctl postgres status
flyctl postgres backup create

# Destroy (careful!)
flyctl destroy
```

---

## 💰 Cost Control

### Monitor Spending
```bash
# Daily monitoring
flyctl status
flyctl metrics

# See what's using resources
flyctl logs | grep -E "memory|cpu"
```

### Reduce Costs
```bash
# Use 1 replica (default is fine)
flyctl scale count 1

# Smaller machine type
flyctl scale vm shared-cpu-1x

# Destroy if not using
flyctl destroy
```

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. App is running
flyctl status
# Output should show: running

# 2. API responds
curl https://pani.fly.dev/health
# Should return: 200 OK

# 3. Frontend loads
curl https://pani.fly.dev/
# Should return: HTML

# 4. API health
curl https://pani.fly.dev/api/health
# Should return: 200 OK

# 5. Database is connected
flyctl logs | grep "database"
# Should NOT show: "connection error"

# 6. Auto-deploy setup
# Make a small code change
git add .
git commit -m "test: verify auto-deploy"
git push origin main
# Should see GitHub Actions workflow running
# Should see new deployment in: flyctl releases
```

---

## 🆘 Troubleshooting

### App won't start
```bash
# See logs
flyctl logs

# Common issues:
# - DATABASE_URL not set: flyctl secrets list
# - Port wrong (must be 8080): check Dockerfile.fly
# - Missing environment var: flyctl secrets list

# Restart app
flyctl apps restart
```

### Database not connecting
```bash
# Check PostgreSQL is running
flyctl postgres status

# Reattach database
flyctl postgres attach pani-db --force --variable DATABASE_URL
```

### Out of budget
```bash
# Check costs
# Go to: https://fly.io/dashboard/billing

# Reduce cost options:
flyctl scale count 1                # 1 replica
flyctl scale vm shared-cpu-1x      # Smallest machine

# If still too expensive, destroy and switch to Hetzner
flyctl destroy
```

---

## 📈 Scaling Later

When you have users and need more power:

```bash
# Add more instances
flyctl scale count 3                # 3 replicas

# Upgrade machine
flyctl scale vm shared-cpu-2x       # 2x CPU
flyctl scale vm performance-1x      # Dedicated CPU

# Auto-scaling (edit fly.toml)
# [metrics]
# handlers = ["cpu", "memory"]
# Fly.io will auto-scale between min/max
```

---

## 🎯 Next Steps

1. **Run setup script** (automated or manual)
2. **Test endpoints** (curl commands above)
3. **Add GitHub secret** (FLY_API_TOKEN)
4. **Commit & push** to trigger auto-deploy
5. **Monitor** with `flyctl logs -f`

---

## 📚 Resources

- [Fly.io Docs](https://fly.io/docs/)
- [Pricing](https://fly.io/docs/about/pricing/)
- [Postgres Guide](https://fly.io/docs/reference/postgres/)
- [CLI Reference](https://fly.io/docs/reference/flyctl/)

---

**Questions?** Check FLYIO_DEPLOYMENT_PLAN.md or FLYIO_CHECKLIST.md for detailed info.
