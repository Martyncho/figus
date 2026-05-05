# 🚀 Quick Setup Guide: From Local to Production

## Your Supabase Credentials

```
Project URL: https://rbkyuwdakjijhsidjnok.supabase.co
Project ID: rbkyuwdakjijhsidjnok
Password: figus***spider2606
Publishable Key: sb_publishable_9QVDpjSuWqjKGu0ZlP3xpQ_4UqC9y8u

DATABASE_URL:
postgresql://postgres:figus***spider2606@db.rbkyuwdakjijhsidjnok.supabase.co:5432/postgres
```

---

## Step 1: Import Database Schema to Supabase

### 1.1 Go to Supabase Dashboard
1. Open: https://rbkyuwdakjijhsidjnok.supabase.co
2. Sign in with your GitHub account

### 1.2 Import Schema
1. Click **"SQL Editor"** in left menu
2. Click **"New Query"**
3. Open file: `schema-export.sql` in this folder
4. Copy **all content**
5. Paste into Supabase SQL Editor
6. Click **"Run"**
7. Wait for completion ✅

### 1.3 Import Data (Optional)
1. Repeat steps 1.1-1.2 with `data-export.sql`
2. This will copy your users, figuritas, and scans

**Note:** If you have test data you want to keep, you can manually add it:

```sql
-- Add test user
INSERT INTO public.users (id, email, username, password_hash, name, provider, avatar_url)
VALUES (
  gen_random_uuid(),
  'test2@test.com',
  'testuser',
  '$2b$10$HASH_HERE', -- bcrypt hash of 'password123'
  'Test User',
  'email',
  NULL
);
```

---

## Step 2: Verify Database Connection

Test the DATABASE_URL locally:

```bash
cd backend

# Create .env.production with DATABASE_URL
# Then test connection:
npm install
npx ts-node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? 'ERROR: ' + err.message : 'SUCCESS: ' + res.rows[0]);
  process.exit(0);
});
"
```

---

## Step 3: Generate Secure Keys

```bash
# Generate JWT_SECRET (32+ chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate REFRESH_TOKEN_SECRET (32+ chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save these values - you'll need them for Railway**

---

## Step 4: Push to GitHub

```bash
cd c:\source\Pani

# Add all changes
git add .

# Commit
git commit -m "feat: prepare for production deployment on Railway + Vercel"

# Push
git push origin main
```

---

## Step 5: Deploy to Railway

### 5.1 Create Railway Account
- Go to: https://railway.app
- Sign up with GitHub
- Authorize Railway

### 5.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Search and select your `Pani` repository
4. Railway will auto-detect Node.js

### 5.3 Add Environment Variables
In Railway dashboard, add these:

| Variable | Value |
|----------|-------|
| DATABASE_URL | `postgresql://postgres:figus***spider2606@db.rbkyuwdakjijhsidjnok.supabase.co:5432/postgres` |
| JWT_SECRET | _(from Step 3)_ |
| REFRESH_TOKEN_SECRET | _(from Step 3)_ |
| JWT_EXPIRY | 7d |
| REFRESH_TOKEN_EXPIRY | 30d |
| CORS_ORIGIN | https://panini.vercel.app |
| NODE_ENV | production |
| PORT | 3000 |

### 5.4 Deploy
- Click **"Deploy"**
- Wait 3-5 minutes for build
- Get your API URL: `https://[project-name].up.railway.app`

**Test:**
```bash
curl https://[your-railway-url]/health
# Should return: {"status":"healthy"}
```

---

## Step 6: Deploy to Vercel

### 6.1 Create Vercel Account
- Go to: https://vercel.com
- Sign up with GitHub
- Authorize Vercel

### 6.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repo
3. Click **"Import"**

### 6.3 Set Environment Variables
Add in **Environment Variables**:

| Variable | Value |
|----------|-------|
| VITE_API_URL | `https://[your-railway-url]` |

### 6.4 Deploy
- Click **"Deploy"**
- Wait 2-3 minutes for build
- Get your URL: `https://panini.vercel.app`

---

## Step 7: Test Production

### 7.1 Frontend
1. Open: https://panini.vercel.app
2. Try login with: test2@test.com / password123
3. Verify dashboard loads
4. Press F5 - session should persist
5. Check browser console (F12) for errors

### 7.2 Backend
```bash
# Test API endpoints
curl https://[railway-url]/health
curl https://[railway-url]/api/auth/register -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test","username":"testuser"}'
```

### 7.3 Database
In Supabase dashboard:
1. Click **"SQL Editor"**
2. Run: `SELECT * FROM public.users LIMIT 1;`
3. Should show test user data

---

## 🎉 Done!

Your app is now live!

- **Frontend:** https://panini.vercel.app
- **Backend API:** https://[railway-url]
- **Database:** Supabase PostgreSQL
- **Cost:** $5/month
- **Uptime:** 99.9%
- **Scalable:** Auto-scales with demand

---

## 📞 Troubleshooting

**Database connection error:**
```
Error: connect ECONNREFUSED
```
- Check DATABASE_URL is correct (copy exact value from Supabase)
- Verify password doesn't have special characters without escaping
- Check IP whitelist in Supabase (should allow all)

**Login not working:**
```
Error: User not found
```
- Verify users table has data
- Check password hash was imported correctly
- Try creating new user from registration form

**Session not persisting:**
```
Logged out after F5
```
- Check JWT_SECRET is set in Railway env vars
- Verify token stored in browser localStorage (F12 → Application)
- Check API logs in Railway dashboard

**Build fails:**
```
npm ERR! code E401
```
- Check package.json has all dependencies
- Run `npm ci` locally to verify
- Check .npmignore doesn't exclude files

---

## Next Steps

1. ✅ Setup custom domain (optional)
   - Vercel: Settings → Domains → Add domain
   - Railway: Settings → Custom Domain → Add domain

2. ✅ Setup analytics
   - Add Vercel Analytics
   - Monitor Railway logs

3. ✅ Setup CI/CD
   - GitHub Actions for automated tests
   - Auto-deploy on push to main

4. ✅ Setup monitoring
   - Vercel Deployment Insights
   - Railway Build Logs

---

## 💰 Monthly Costs

| Service | Cost |
|---------|------|
| Vercel (Frontend) | FREE |
| Railway (Backend) | $5/month |
| Supabase (Database) | FREE (up to 500MB) |
| **TOTAL** | **$5/month** |

Way cheaper than AWS! 🎉

---

Questions? Check these docs:
- Supabase: https://supabase.io/docs
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
