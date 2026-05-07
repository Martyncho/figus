#!/bin/bash

# Quick Start - Testing Production Setup Locally
# Este script prepara todo para testear la configuración de producción

set -e

echo "🚀 Pani App - Production Testing Setup"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Create necessary directories
echo -e "${YELLOW}[1/4] Creating directories...${NC}"
mkdir -p config/ssl
mkdir -p backups
echo -e "${GREEN}✓ Directories created${NC}"

# 2. Create .env file
echo -e "${YELLOW}[2/4] Creating .env file...${NC}"
if [ -f .env ]; then
    echo -e "${YELLOW}⚠ .env already exists, backing up to .env.backup${NC}"
    cp .env .env.backup
fi

cat > .env << 'EOF'
# Production Testing Environment
DB_NAME=pani_db
DB_USER=pani_user
DB_PASSWORD=testpass123secure
REDIS_PASSWORD=redispass123secure
JWT_SECRET=test_jwt_secret_very_long_and_random_12345
AWS_ACCESS_KEY_ID=your_aws_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=pani-stickers
CORS_ORIGIN=http://localhost
NODE_ENV=production
EOF

chmod 600 .env
echo -e "${GREEN}✓ .env file created${NC}"

# 3. Check Docker
echo -e "${YELLOW}[3/4] Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker first.${NC}"
    exit 1
fi
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

# 4. Build images
echo -e "${YELLOW}[4/4] Building Docker images...${NC}"
echo -e "${YELLOW}This may take a few minutes on first run...${NC}"
docker compose -f docker-compose.prod.yml build

echo ""
echo -e "${GREEN}======================================"
echo "✅ Setup Complete!"
echo "=====================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Start services:"
echo "   ${GREEN}docker compose -f docker-compose.prod.yml up -d${NC}"
echo ""
echo "2. Check status:"
echo "   ${GREEN}docker compose -f docker-compose.prod.yml ps${NC}"
echo ""
echo "3. Test endpoints:"
echo "   ${GREEN}curl http://localhost/health${NC}"
echo "   ${GREEN}curl http://localhost/api/health${NC}"
echo "   ${GREEN}curl http://localhost/${NC}"
echo ""
echo "4. View logs:"
echo "   ${GREEN}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo ""
echo "5. Stop services:"
echo "   ${GREEN}docker compose -f docker-compose.prod.yml down${NC}"
echo ""
echo "See TESTING_LOCAL.md for detailed instructions and troubleshooting"
echo ""
