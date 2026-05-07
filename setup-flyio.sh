#!/bin/bash

# Fly.io Complete Setup Script (Bash)
# This script automates the entire Fly.io deployment setup

set -e

echo "🚀 Pani App - Fly.io Complete Setup"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check flyctl installation
echo -e "${YELLOW}[1/8] Checking Fly CLI...${NC}"
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}✗ Flyctl not found. Install from: https://fly.io/docs/getting-started/installing-flyctl/${NC}"
    echo ""
    echo -e "${YELLOW}macOS:${NC}"
    echo "  brew install flyctl"
    echo ""
    echo -e "${YELLOW}Linux:${NC}"
    echo "  curl -L https://fly.io/install.sh | sh"
    exit 1
fi
echo -e "${GREEN}✓ Flyctl is installed: $(flyctl version)${NC}"

# Check if logged in
echo ""
echo -e "${YELLOW}[2/8] Checking Fly.io authentication...${NC}"
if flyctl auth whoami &> /dev/null; then
    AUTH_USER=$(flyctl auth whoami)
    echo -e "${GREEN}✓ Logged in as: $AUTH_USER${NC}"
else
    echo -e "${YELLOW}⚠ Not logged in. Starting login flow...${NC}"
    flyctl auth login
fi

# Create app
echo ""
echo -e "${YELLOW}[3/8] Creating Fly.io app...${NC}"
read -p "Enter app name (default: pani): " APP_NAME
APP_NAME=${APP_NAME:-pani}

if flyctl app create "$APP_NAME" 2>/dev/null || true; then
    echo -e "${GREEN}✓ App created: $APP_NAME${NC}"
else
    echo -e "${YELLOW}⚠ App might already exist, continuing...${NC}"
fi

# Show region selection
echo ""
echo -e "${YELLOW}[4/8] Selecting region...${NC}"
echo -e "${YELLOW}Recommended regions:${NC}"
echo -e "${CYAN}  sjc  - San Jose, USA${NC}"
echo -e "${CYAN}  iad  - Washington DC, USA${NC}"
echo -e "${CYAN}  cdg  - Paris, EU${NC}"
echo -e "${CYAN}  ams  - Amsterdam, EU${NC}"
read -p "Enter region (default: sjc): " REGION
REGION=${REGION:-sjc}
echo -e "${GREEN}✓ Region selected: $REGION${NC}"

# Create PostgreSQL
echo ""
echo -e "${YELLOW}[5/8] Creating PostgreSQL database...${NC}"
echo -e "${CYAN}This creates a shared PostgreSQL instance (USD 13/month)${NC}"
read -p "Create PostgreSQL? (y/n, default: y): " CREATE_PG
CREATE_PG=${CREATE_PG:-y}

if [[ "$CREATE_PG" == "y" || "$CREATE_PG" == "Y" ]]; then
    if flyctl postgres create --name pani-db --region "$REGION" --initial-cluster-size 1 --volume-size 10 --password-prompt 2>/dev/null || true; then
        echo -e "${GREEN}✓ PostgreSQL created${NC}"
    else
        echo -e "${YELLOW}⚠ Could not create PostgreSQL automatically${NC}"
        echo -e "${YELLOW}Create manually: flyctl postgres create --name pani-db --region $REGION${NC}"
    fi
fi

# Setup secrets
echo ""
echo -e "${YELLOW}[6/8] Configuring secrets and environment variables...${NC}"

# Get DATABASE_URL
echo ""
echo -e "${YELLOW}Getting DATABASE_URL from PostgreSQL...${NC}"
if flyctl postgres attach pani-db --app "$APP_NAME" --variable DATABASE_URL 2>/dev/null || true; then
    echo -e "${GREEN}✓ DATABASE_URL attached${NC}"
else
    echo -e "${YELLOW}⚠ Could not attach database. Do it manually:${NC}"
    echo -e "${YELLOW}  flyctl postgres attach pani-db --variable DATABASE_URL${NC}"
fi

# Redis setup
echo ""
echo -e "${YELLOW}For Redis, use Upstash (free tier available):${NC}"
echo -e "${CYAN}  1. Go to https://upstash.com${NC}"
echo -e "${CYAN}  2. Create account & Redis database${NC}"
echo -e "${CYAN}  3. Copy connection string${NC}"
read -p "Paste Redis connection URL (or leave empty for now): " REDIS_URL

# Set secrets
echo ""
echo -e "${YELLOW}Setting required secrets...${NC}"

read -p "JWT Secret (or press Enter for auto-generated): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated JWT Secret: $JWT_SECRET"
fi

read -p "AWS Access Key (press Enter to skip): " AWS_ACCESS_KEY
read -p "AWS Secret Key (press Enter to skip): " AWS_SECRET_KEY
read -p "AWS S3 Bucket (default: pani-stickers): " AWS_BUCKET
AWS_BUCKET=${AWS_BUCKET:-pani-stickers}

read -p "CORS Origin (default: https://$APP_NAME.fly.dev): " CORS_ORIGIN
CORS_ORIGIN=${CORS_ORIGIN:-https://$APP_NAME.fly.dev}

# Write secrets to Fly.io
echo ""
echo -e "${YELLOW}Writing secrets to Fly.io...${NC}"

flyctl secrets set JWT_SECRET="$JWT_SECRET" CORS_ORIGIN="$CORS_ORIGIN" AWS_S3_BUCKET="$AWS_BUCKET" NODE_ENV=production --app "$APP_NAME"

if [ -n "$REDIS_URL" ]; then
    flyctl secrets set REDIS_URL="$REDIS_URL" --app "$APP_NAME"
fi

if [ -n "$AWS_ACCESS_KEY" ] && [ -n "$AWS_SECRET_KEY" ]; then
    flyctl secrets set AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY" --app "$APP_NAME"
fi

echo -e "${GREEN}✓ Secrets configured${NC}"

# Deploy
echo ""
echo -e "${YELLOW}[7/8] Deploying to Fly.io...${NC}"
echo -e "${CYAN}This will build and deploy your app (5-10 minutes)${NC}"

if flyctl deploy --remote-only --app "$APP_NAME"; then
    echo -e "${GREEN}✓ Deployment completed${NC}"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    echo -e "${YELLOW}Run manually: flyctl deploy --remote-only${NC}"
    exit 1
fi

# Verification
echo ""
echo -e "${YELLOW}[8/8] Verifying deployment...${NC}"

sleep 5

if flyctl status --app "$APP_NAME"; then
    echo -e "${GREEN}✓ App status retrieved${NC}"
else
    echo -e "${YELLOW}⚠ Could not check status${NC}"
fi

# Final info
echo ""
echo "======================================"
echo -e "${GREEN}✅ Fly.io Setup Complete!${NC}"
echo "======================================"
echo ""
echo -e "${GREEN}Your app is live at:${NC}"
echo -e "${CYAN}  https://$APP_NAME.fly.dev${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${CYAN}  1. Commit all files to GitHub${NC}"
echo "     git add ."
echo "     git commit -m 'feat: fly.io deployment'"
echo "     git push origin main"
echo ""
echo -e "${CYAN}  2. Add FLY_API_TOKEN to GitHub Secrets${NC}"
echo "     flyctl auth token"
echo "     Go to GitHub repo → Settings → Secrets → New (FLY_API_TOKEN)"
echo ""
echo -e "${CYAN}  3. GitHub Actions will auto-deploy on every push to main${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  flyctl status"
echo "  flyctl logs -f"
echo "  flyctl metrics"
echo "  flyctl scale vm shared-cpu-1x"
echo "  flyctl destroy"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo -e "${CYAN}  https://fly.io/docs/${NC}"
echo ""
