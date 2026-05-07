# Fly.io Complete Setup Script (PowerShell)
# This script automates the entire Fly.io deployment setup

Write-Host "🚀 Pani App - Fly.io Complete Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

# Check flyctl installation
Write-Host "[1/8] Checking Fly CLI..." -ForegroundColor $Yellow
try {
    $flyVersion = flyctl version
    Write-Host "✓ Flyctl is installed: $flyVersion" -ForegroundColor $Green
} catch {
    Write-Host "✗ Flyctl not found. Install from: https://fly.io/docs/getting-started/installing-flyctl/" -ForegroundColor $Red
    Write-Host ""
    Write-Host "Windows PowerShell:" -ForegroundColor $Yellow
    Write-Host "  pwsh -Command `"iwr https://fly.io/install.ps1 -useb | iex`"" -ForegroundColor Cyan
    exit 1
}

# Check if logged in
Write-Host ""
Write-Host "[2/8] Checking Fly.io authentication..." -ForegroundColor $Yellow
try {
    $auth = flyctl auth whoami 2>$null
    Write-Host "✓ Logged in as: $auth" -ForegroundColor $Green
} catch {
    Write-Host "⚠ Not logged in. Starting login flow..." -ForegroundColor $Yellow
    flyctl auth login
}

# Create app
Write-Host ""
Write-Host "[3/8] Creating Fly.io app..." -ForegroundColor $Yellow
$appName = Read-Host "Enter app name (e.g., pani) or press Enter for 'pani'"
if ([string]::IsNullOrEmpty($appName)) { $appName = "pani" }

try {
    flyctl app create $appName 2>$null
    Write-Host "✓ App created: $appName" -ForegroundColor $Green
} catch {
    Write-Host "⚠ App might already exist, continuing..." -ForegroundColor $Yellow
}

# Show region selection
Write-Host ""
Write-Host "[4/8] Selecting region..." -ForegroundColor $Yellow
Write-Host "Recommended regions:" -ForegroundColor $Yellow
Write-Host "  sjc  - San Jose, USA" -ForegroundColor Cyan
Write-Host "  iad  - Washington DC, USA" -ForegroundColor Cyan
Write-Host "  cdg  - Paris, EU" -ForegroundColor Cyan
Write-Host "  ams  - Amsterdam, EU" -ForegroundColor Cyan
$region = Read-Host "Enter region (default: sjc)"
if ([string]::IsNullOrEmpty($region)) { $region = "sjc" }
Write-Host "✓ Region selected: $region" -ForegroundColor $Green

# Update fly.toml with selected region
Write-Host ""
Write-Host "[5/8] Creating PostgreSQL database..." -ForegroundColor $Yellow
Write-Host "This creates a shared PostgreSQL instance (USD 13/month)" -ForegroundColor Cyan
$createPG = Read-Host "Create PostgreSQL? (y/n, default: y)"
if ($createPG -ne 'n' -and $createPG -ne 'N') {
    try {
        flyctl postgres create --name pani-db --region $region --initial-cluster-size 1 --volume-size 10 --password-prompt 2>$null
        Write-Host "✓ PostgreSQL created" -ForegroundColor $Green
    } catch {
        Write-Host "⚠ Could not create PostgreSQL automatically" -ForegroundColor $Yellow
        Write-Host "Create manually: flyctl postgres create --name pani-db --region $region" -ForegroundColor Yellow
    }
}

# Setup secrets
Write-Host ""
Write-Host "[6/8] Configuring secrets and environment variables..." -ForegroundColor $Yellow

# Get DATABASE_URL
Write-Host ""
Write-Host "Getting DATABASE_URL from PostgreSQL..." -ForegroundColor $Yellow
try {
    $dbUrl = flyctl postgres attach pani-db --app $appName --variable DATABASE_URL 2>&1
    Write-Host "✓ DATABASE_URL attached" -ForegroundColor $Green
} catch {
    Write-Host "⚠ Could not attach database. Do it manually:" -ForegroundColor $Yellow
    Write-Host "  flyctl postgres attach pani-db --variable DATABASE_URL" -ForegroundColor Yellow
}

# Redis setup
Write-Host ""
Write-Host "For Redis, use Upstash (free tier available):" -ForegroundColor $Yellow
Write-Host "  1. Go to https://upstash.com" -ForegroundColor Cyan
Write-Host "  2. Create account & Redis database" -ForegroundColor Cyan
Write-Host "  3. Copy connection string" -ForegroundColor Cyan
$redisUrl = Read-Host "Paste Redis connection URL (or leave empty for now)"

# Set secrets
Write-Host ""
Write-Host "Setting required secrets..." -ForegroundColor $Yellow

$jwtSecret = Read-Host "JWT Secret (or press Enter for auto-generated)"
if ([string]::IsNullOrEmpty($jwtSecret)) {
    $jwtSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
}

$awsAccessKey = Read-Host "AWS Access Key (press Enter to skip)"
$awsSecretKey = Read-Host "AWS Secret Key (press Enter to skip)"
$awsBucket = Read-Host "AWS S3 Bucket (default: pani-stickers)"
if ([string]::IsNullOrEmpty($awsBucket)) { $awsBucket = "pani-stickers" }

$corsOrigin = Read-Host "CORS Origin (default: https://$appName.fly.dev)"
if ([string]::IsNullOrEmpty($corsOrigin)) { $corsOrigin = "https://$appName.fly.dev" }

# Set all secrets
Write-Host ""
Write-Host "Writing secrets to Fly.io..." -ForegroundColor $Yellow

$secrets = @(
    "JWT_SECRET=$jwtSecret",
    "CORS_ORIGIN=$corsOrigin",
    "AWS_S3_BUCKET=$awsBucket",
    "NODE_ENV=production"
)

if (-not [string]::IsNullOrEmpty($redisUrl)) {
    $secrets += "REDIS_URL=$redisUrl"
}

if (-not [string]::IsNullOrEmpty($awsAccessKey)) {
    $secrets += "AWS_ACCESS_KEY_ID=$awsAccessKey"
    $secrets += "AWS_SECRET_ACCESS_KEY=$awsSecretKey"
}

foreach ($secret in $secrets) {
    flyctl secrets set $secret --app $appName
}

Write-Host "✓ Secrets configured" -ForegroundColor $Green

# Deploy
Write-Host ""
Write-Host "[7/8] Deploying to Fly.io..." -ForegroundColor $Yellow
Write-Host "This will build and deploy your app (5-10 minutes)" -ForegroundColor Cyan

try {
    flyctl deploy --remote-only --app $appName
    Write-Host "✓ Deployment completed" -ForegroundColor $Green
} catch {
    Write-Host "✗ Deployment failed" -ForegroundColor $Red
    Write-Host "Run manually: flyctl deploy --remote-only" -ForegroundColor Yellow
    exit 1
}

# Verification
Write-Host ""
Write-Host "[8/8] Verifying deployment..." -ForegroundColor $Yellow

Start-Sleep -Seconds 5

try {
    $status = flyctl status --app $appName
    Write-Host "✓ App status:" -ForegroundColor $Green
    Write-Host $status
} catch {
    Write-Host "⚠ Could not check status" -ForegroundColor $Yellow
}

# Final info
Write-Host ""
Write-Host "======================================" -ForegroundColor $Green
Write-Host "✅ Fly.io Setup Complete!" -ForegroundColor $Green
Write-Host "======================================" -ForegroundColor $Green
Write-Host ""
Write-Host "Your app is live at:" -ForegroundColor $Green
Write-Host "  https://$appName.fly.dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $Yellow
Write-Host "  1. Commit all files to GitHub" -ForegroundColor Cyan
Write-Host "     git add ." -ForegroundColor Gray
Write-Host "     git commit -m 'feat: fly.io deployment'" -ForegroundColor Gray
Write-Host "     git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Add FLY_API_TOKEN to GitHub Secrets" -ForegroundColor Cyan
Write-Host "     flyctl auth token" -ForegroundColor Gray
Write-Host "     Go to GitHub repo → Settings → Secrets → New (FLY_API_TOKEN)" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. GitHub Actions will auto-deploy on every push to main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor $Yellow
Write-Host "  flyctl status" -ForegroundColor Gray
Write-Host "  flyctl logs -f" -ForegroundColor Gray
Write-Host "  flyctl metrics" -ForegroundColor Gray
Write-Host "  flyctl scale vm shared-cpu-1x" -ForegroundColor Gray
Write-Host "  flyctl destroy" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation:" -ForegroundColor $Yellow
Write-Host "  https://fly.io/docs/" -ForegroundColor Cyan
Write-Host ""
