#!/bin/bash

##############################################
# House of Neelam - DigitalOcean Deployment
# Automated Setup Script
##############################################

set -e  # Exit on error

echo "🚀 Starting House of Neelam Deployment..."
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Running as root${NC}"

# Update system
echo -e "\n${YELLOW}📦 Updating system packages...${NC}"
apt-get update -y
apt-get upgrade -y

# Install Docker
echo -e "\n${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "\n${YELLOW}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Install Certbot for SSL
echo -e "\n${YELLOW}🔒 Installing Certbot for SSL...${NC}"
apt-get install -y certbot python3-certbot-nginx
echo -e "${GREEN}✓ Certbot installed${NC}"

# Create app directory
echo -e "\n${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p /opt/house-of-neelam
cd /opt/house-of-neelam

# Clone or copy application
echo -e "\n${YELLOW}📥 Please provide your GitHub repository URL:${NC}"
read -p "GitHub URL (or press Enter to skip): " GITHUB_URL

if [ ! -z "$GITHUB_URL" ]; then
    echo -e "${YELLOW}Cloning repository...${NC}"
    git clone $GITHUB_URL .
    echo -e "${GREEN}✓ Repository cloned${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping clone. Please upload your files to /opt/house-of-neelam${NC}"
fi

# Create .env file
echo -e "\n${YELLOW}⚙️  Creating environment configuration...${NC}"

if [ ! -f .env ]; then
    cat > .env << EOF
# MongoDB
MONGO_PASSWORD=changeme_$(openssl rand -hex 16)

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin
ADMIN_EMAIL=admin@houseofneelam.com
ADMIN_PASSWORD_HASH=\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYK5H3Q3T5C

# Domain
DOMAIN=yourdomain.com
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit /opt/house-of-neelam/.env with your actual credentials${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Setup firewall
echo -e "\n${YELLOW}🔥 Configuring firewall...${NC}"
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"

# Get domain name
echo -e "\n${YELLOW}🌐 Domain Configuration${NC}"
read -p "Enter your domain name (e.g., houseofneelam.com): " DOMAIN

if [ ! -z "$DOMAIN" ]; then
    # Update nginx config with domain
    sed -i "s/yourdomain.com/$DOMAIN/g" nginx/nginx.conf
    sed -i "s/yourdomain.com/$DOMAIN/g" docker-compose.yml
    echo -e "${GREEN}✓ Domain configured: $DOMAIN${NC}"
    
    # Setup SSL with Let's Encrypt
    echo -e "\n${YELLOW}🔒 Setting up SSL certificate...${NC}"
    read -p "Do you want to setup SSL now? (y/n): " SETUP_SSL
    
    if [ "$SETUP_SSL" = "y" ]; then
        echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
        certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # Copy certificates to nginx folder
        mkdir -p nginx/ssl
        cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
        cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
        echo -e "${GREEN}✓ SSL certificate installed${NC}"
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet --post-hook 'docker-compose restart nginx'") | crontab -
        echo -e "${GREEN}✓ SSL auto-renewal configured${NC}"
    fi
fi

# Build and start containers
echo -e "\n${YELLOW}🏗️  Building and starting containers...${NC}"
docker-compose build
docker-compose up -d

echo -e "\n${GREEN}✓ Containers started${NC}"

# Wait for services to be ready
echo -e "\n${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check container status
echo -e "\n${YELLOW}📊 Container Status:${NC}"
docker-compose ps

# Setup automatic backups
echo -e "\n${YELLOW}💾 Setting up automatic database backups...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * cd /opt/house-of-neelam && docker-compose exec -T mongodb mongodump --out /backups/backup_\$(date +\%Y\%m\%d)") | crontab -
echo -e "${GREEN}✓ Daily backups scheduled (2 AM)${NC}"

# Display final information
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "\n${YELLOW}📝 Important Information:${NC}"
echo -e "1. Application URL: http://$(curl -s ifconfig.me)"
if [ ! -z "$DOMAIN" ]; then
    echo -e "2. Domain: https://$DOMAIN (after DNS propagation)"
fi
echo -e "3. Admin Panel: /admin/login"
echo -e "4. Admin Email: admin@houseofneelam.com"
echo -e "5. Admin Password: admin123 (CHANGE THIS!)"
echo -e "\n${YELLOW}⚠️  Next Steps:${NC}"
echo -e "1. Edit /opt/house-of-neelam/.env with your Razorpay credentials"
echo -e "2. Update DNS records to point to this server: $(curl -s ifconfig.me)"
echo -e "3. Change default admin password"
echo -e "4. Restart containers: cd /opt/house-of-neelam && docker-compose restart"
echo -e "\n${YELLOW}📚 Useful Commands:${NC}"
echo -e "View logs: docker-compose logs -f"
echo -e "Restart: docker-compose restart"
echo -e "Stop: docker-compose down"
echo -e "Update: git pull && docker-compose up -d --build"
echo -e "\n${GREEN}🎉 Happy Selling!${NC}"
