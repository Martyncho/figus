# 🚀 Deployment Guide: Vercel + Railway + Supabase

## Step 1: Create Supabase Account (5-10 min)

### 1.1 Create Account
- Go to https://supabase.com
- Click "Sign Up" or "Get Started"
- Use GitHub account (recommended)
- Select region: São Paulo (or closest to you)
- Create project: `panini-prod`
- **Save the password displayed** - you'll need it

### 1.2 Create Database Schema
Once in Supabase dashboard:

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Paste your schema (see below)
4. Click **"Run"**

**Schema SQL:**
```sql
-- Create tables from your existing database
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'email',
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE figuritas (
  id VARCHAR(50) PRIMARY KEY,
  numero INTEGER NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  team VARCHAR(255),
  type VARCHAR(50),
  rareza VARCHAR(50),
  anio INTEGER,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  figurita_id VARCHAR(50) NOT NULL REFERENCES figuritas(id),
  quantity INTEGER DEFAULT 1,
  scanned_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_figurita_id ON scans(figurita_id);
```

### 1.3 Get Connection Details
In Supabase dashboard:
1. Go to **Settings → Database**
2. Copy **Connection String** (URI)
3. Replace `[YOUR-PASSWORD]` with the password from step 1.1
4. This is your `DATABASE_URL`

**Format:** `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`

---

## Step 2: Push Code to GitHub (2 min)

```bash
cd c:\source\Pani

git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

---

## Step 3: Deploy Backend to Railway (10 min)

### 3.1 Create Railway Account
- Go to https://railway.app
- Sign up with GitHub
- Authorize Railway to access your repos

### 3.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Search for `Pani` (or your repo name)
4. Select the repo
5. Select branch: `main`
6. Railway will auto-detect Node.js

### 3.3 Configure Environment Variables
In Railway dashboard, add these variables:

```
DATABASE_URL = postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

JWT_SECRET = [generate random string: openssl rand -base64 32]

JWT_EXPIRY = 7d

REFRESH_TOKEN_SECRET = [generate another random string]

REFRESH_TOKEN_EXPIRY = 30d

CORS_ORIGIN = https://panini.vercel.app

NODE_ENV = production

PORT = 3000
```

### 3.4 Deploy
- Click **"Deploy"**
- Wait for build to complete (3-5 min)
- Get your API URL: `https://[project-name].up.railway.app`

**Test it:**
```bash
curl https://[project-name].up.railway.app/health
```

---

## Step 4: Deploy Frontend to Vercel (8 min)

### 4.1 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub
- Authorize Vercel

### 4.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repo
3. Click **"Import"**

### 4.3 Configure Environment Variables
Add these in **Environment Variables**:

```
VITE_API_URL = https://[your-railway-project].up.railway.app
```

### 4.4 Deploy
- Click **"Deploy"**
- Wait for build to complete (2-3 min)
- Get your URL: `https://panini.vercel.app`

---

## Step 5: Test Production Deployment (5 min)

### 5.1 Test Backend
```bash
# Test health endpoint
curl https://[railway-url]/health

# Expected response:
# {"status":"healthy"}
```

### 5.2 Test Frontend
1. Open https://panini.vercel.app in browser
2. Try to login with: test2@test.com / password123
3. Verify dashboard loads
4. Press F5 - session should persist
5. Check console (F12) for any errors

### 5.3 Check Logs
**Railway logs:**
- Dashboard → Click project → View logs

**Vercel logs:**
- Dashboard → Click project → Deployments → View logs

---

## Step 6: Setup Custom Domain (Optional)

### 6.1 Add Custom Domain to Vercel
1. Vercel Dashboard → Settings → Domains
2. Add your domain: `panini.yourdomain.com`
3. Add DNS records (Vercel will show instructions)
4. Wait for SSL certificate (usually instant)

### 6.2 Add Custom Domain to Railway (Optional)
1. Railway Dashboard → Settings → Custom Domain
2. Add your API domain: `api.yourdomain.com`
3. Update frontend env var to use new domain

---

## ✅ Final Checklist

- [ ] Supabase database created
- [ ] Database schema imported
- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set correctly
- [ ] Login/logout working
- [ ] Session recovery working (F5 refresh)
- [ ] No console errors
- [ ] Custom domain configured (optional)

---

## 💰 Costs

| Service | Free Tier | Cost |
|---------|-----------|------|
| Supabase | 500MB DB | $0 |
| Railway | - | $5/mo |
| Vercel | Unlimited | $0 |
| Redis | 30MB | $0 |
| **TOTAL** | | **$5/mo** |

---

## 🆘 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
- Check `DATABASE_URL` is correct
- Verify IP whitelist in Supabase (should be open to all)
- Check migration ran successfully

### Login Not Working
```
Error: User not found
```
- Check users table has test data
- Run: `INSERT INTO users VALUES (...)`
- Check password hash algorithm matches

### Session Not Recovering
```
No session after refresh
```
- Check localStorage has token
- Check F12 console for errors
- Verify JWT_SECRET matches between dev/prod

### Build Fails on Railway
```
npm ERR! ERR! code E401
```
- Check package.json dependencies
- Run `npm ci` locally to verify
- Check NODE_ENV is not set to production during build

---

## 📚 Useful Links

- Supabase Docs: https://supabase.io/docs
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- PostgreSQL: https://www.postgresql.org/docs

---

## 🎉 You're Done!

Your app is now live at:
- **Frontend:** https://panini.vercel.app
- **Backend:** https://[railway-url]/health
- **Database:** Supabase dashboard
- **Cost:** $5/month

Enjoy! 🚀
