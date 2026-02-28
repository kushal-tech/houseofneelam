# DigitalOcean Deployment Guide
## Complete Step-by-Step Setup for House of Neelam

---

## 💰 Cost: $15/month (vs $50 Emergent) - Save 70%!

---

## 📋 Prerequisites

- [ ] DigitalOcean account (get $200 credit: https://m.do.co/c/yourreferralcode)
- [ ] Domain name purchased (GoDaddy, Namecheap, etc.)
- [ ] 15 minutes of your time

---

## 🚀 Step-by-Step Deployment (15 Minutes)

### Step 1: Create DigitalOcean Droplet (3 minutes)

1. **Login to DigitalOcean:** https://cloud.digitalocean.com

2. **Create New Droplet:**
   - Click **"Create"** → **"Droplets"**
   
3. **Choose Image:**
   - Select: **Ubuntu 22.04 LTS**
   
4. **Choose Plan:**
   - **Basic Plan**
   - **Regular Intel CPU**
   - **$12/month** (2GB RAM, 50GB SSD, 2TB transfer)
   
5. **Choose Region:**
   - Select closest to your customers
   - India: **Bangalore**
   - USA: **New York** or **San Francisco**
   - Europe: **London** or **Frankfurt**
   
6. **Authentication:**
   - Choose **"SSH Key"** (recommended) OR **"Password"**
   - If SSH Key: Add your SSH public key
   - If Password: Set a strong root password
   
7. **Enable Backups (Optional but Recommended):**
   - Check **"Backups"** (+$2.40/month)
   
8. **Hostname:**
   - Name: `neelam-production`
   
9. **Click "Create Droplet"**
   - Wait 1-2 minutes for droplet to be created
   - **Note the IP address** (e.g., 165.22.xxx.xxx)

---

### Step 2: Connect to Your Server (2 minutes)

**Option A: SSH (Recommended)**
```bash
# From your computer terminal
ssh root@YOUR_DROPLET_IP

# Example:
ssh root@165.22.xxx.xxx
```

**Option B: DigitalOcean Console**
- Click on your droplet
- Click **"Console"** button (top right)
- Login with root password

---

### Step 3: Upload Your Code (3 minutes)

**Option A: From GitHub (Recommended)**
```bash
# On your server
cd /opt
git clone https://github.com/YOUR_USERNAME/house-of-neelam.git
cd house-of-neelam
```

**Option B: Upload from Local**
```bash
# From your computer (before connecting to server)
scp -r /path/to/house-of-neelam root@YOUR_DROPLET_IP:/opt/
```

**Option C: Manual File Transfer**
- Use FileZilla or WinSCP
- Connect to: YOUR_DROPLET_IP
- Upload to: /opt/house-of-neelam

---

### Step 4: Run Automated Deployment Script (5 minutes)

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
sudo ./deploy.sh
```

**What the script does (automatically):**
- ✅ Updates Ubuntu packages
- ✅ Installs Docker & Docker Compose
- ✅ Installs Certbot for SSL
- ✅ Creates .env configuration file
- ✅ Sets up firewall
- ✅ Builds containers (Frontend, Backend, Database)
- ✅ Starts all services
- ✅ Schedules automatic database backups

**During script execution:**
- Enter your domain when prompted (e.g., houseofneelam.com)
- Choose 'y' for SSL setup
- Wait for completion (~5 minutes)

---

### Step 5: Configure Environment Variables (2 minutes)

```bash
# Edit .env file
nano /opt/house-of-neelam/.env
```

**Update these values:**
```env
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_SLVXTd12dTdLEA
RAZORPAY_KEY_SECRET=DwVteP25D8mg9Z6mYqJH28Cc

# Your Domain
DOMAIN=houseofneelam.com
```

**Save and exit:**
- Press `CTRL + X`
- Press `Y`
- Press `ENTER`

**Restart containers:**
```bash
docker-compose restart
```

---

### Step 6: Point Domain to Server (5 minutes)

**Go to your domain registrar (GoDaddy, Namecheap, etc.)**

**Add these DNS records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_DROPLET_IP | 300 |
| A | www | YOUR_DROPLET_IP | 300 |

**Example:**
```
Type: A
Name: @
Value: 165.22.xxx.xxx
TTL: 300

Type: A  
Name: www
Value: 165.22.xxx.xxx
TTL: 300
```

**Wait 5-30 minutes** for DNS propagation

---

### Step 7: Verify Installation

**Check if services are running:**
```bash
docker-compose ps
```

**Should see:**
```
NAME                STATUS
neelam_backend      Up
neelam_frontend     Up
neelam_mongodb      Up
neelam_nginx        Up
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

**Test endpoints:**
```bash
# Test backend API
curl http://YOUR_DROPLET_IP:8001/docs

# Test frontend
curl http://YOUR_DROPLET_IP
```

---

## ✅ Access Your Application

### Via IP (Immediate):
- **Website:** http://YOUR_DROPLET_IP
- **Admin:** http://YOUR_DROPLET_IP/admin/login
- **API Docs:** http://YOUR_DROPLET_IP:8001/docs

### Via Domain (After DNS propagation):
- **Website:** https://yourdomain.com
- **Admin:** https://yourdomain.com/admin/login
- **API Docs:** https://yourdomain.com/docs

**Default Admin Credentials:**
- Email: admin@houseofneelam.com
- Password: admin123
- ⚠️ **CHANGE THIS IMMEDIATELY!**

---

## 🔧 Common Management Tasks

### Update Application
```bash
cd /opt/house-of-neelam
git pull
docker-compose up -d --build
```

### View Logs
```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f backend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop/Start Application
```bash
# Stop
docker-compose down

# Start
docker-compose up -d
```

### Database Backup (Manual)
```bash
cd /opt/house-of-neelam
docker-compose exec mongodb mongodump --out /backups/manual_backup_$(date +%Y%m%d)
```

### Check Disk Space
```bash
df -h
```

### Check Memory Usage
```bash
free -h
```

### Monitor Resources
```bash
htop
# or
docker stats
```

---

## 🔒 Security Checklist

- [ ] Change admin password
- [ ] Update .env with production keys
- [ ] Enable backups ($2.40/month)
- [ ] Setup monitoring (optional)
- [ ] Regular updates: `apt update && apt upgrade`
- [ ] Review firewall rules: `ufw status`
- [ ] Check SSL certificate: `certbot certificates`

---

## 🆘 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild container
docker-compose up -d --build backend
```

### SSL Certificate Issues
```bash
# Renew certificate
certbot renew

# Check certificate status
certbot certificates
```

### Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Kill process if needed
kill -9 PID
```

### Out of Memory
```bash
# Check memory
free -h

# Restart containers
docker-compose restart
```

### Database Connection Failed
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

---

## 📊 Monitoring (Optional)

### Setup Uptime Monitoring (FREE)
- **UptimeRobot:** https://uptimerobot.com
- Add your domain
- Get alerts via email/SMS when site goes down

### Setup Error Tracking
- **Sentry:** https://sentry.io
- Free tier available
- Track frontend & backend errors

---

## 💡 Optimization Tips

### Enable Swap (If low memory)
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Clean Docker Resources
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a
```

### Setup Cron Jobs
```bash
# Edit crontab
crontab -e

# Add useful cron jobs:
# Daily backup at 2 AM
0 2 * * * cd /opt/house-of-neelam && docker-compose exec -T mongodb mongodump --out /backups/backup_$(date +\%Y\%m\%d)

# Weekly cleanup
0 3 * * 0 docker system prune -f

# Monthly updates
0 4 1 * * apt update && apt upgrade -y && docker-compose pull && docker-compose up -d
```

---

## 🎯 Performance Benchmarks

### Expected Performance (Basic Droplet - $12/month):
- **Concurrent Users:** 50-100
- **Page Load Time:** < 2 seconds
- **API Response:** < 200ms
- **Database Queries:** < 50ms
- **Uptime:** 99.9%

### When to Upgrade:
- **Traffic > 10K visitors/month** → Upgrade to $24/month (4GB RAM)
- **Slow response times** → Add caching (Redis)
- **High database load** → Separate database droplet

---

## 📞 Support Resources

### DigitalOcean
- **Documentation:** https://docs.digitalocean.com
- **Community:** https://www.digitalocean.com/community
- **Support Tickets:** Available in dashboard

### Your Application
- **GitHub Issues:** Create issue in your repo
- **API Docs:** https://yourdomain.com/docs
- **Logs:** `docker-compose logs -f`

---

## 🎉 Success!

Your House of Neelam e-commerce platform is now live on DigitalOcean!

**What You've Achieved:**
- ✅ Saved 70% on hosting costs ($427/year)
- ✅ Full control over your infrastructure
- ✅ Automated deployment & backups
- ✅ Production-ready setup with SSL
- ✅ Scalable architecture with Docker

**Monthly Costs:**
- Droplet: $12/month
- Backups: $2.40/month (optional)
- Domain: ~$1/month
- **Total: $15.40/month**

---

**Need help? Check DIGITALOCEAN_COSTS.md for detailed cost comparison!**
