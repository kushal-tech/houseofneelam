# Quick Start Guide - House of Neelam

## 🚀 Get Up and Running in 5 Minutes

### Prerequisites Checklist
- [ ] Node.js (v16+) installed
- [ ] Python (v3.9+) installed
- [ ] MongoDB installed and running
- [ ] Yarn installed (`npm install -g yarn`)

---

## Step-by-Step Setup

### 1️⃣ Install Dependencies (2 minutes)

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
yarn install
```

### 2️⃣ Configure Environment (1 minute)

**Backend `.env`:**
```bash
cd backend
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=house_of_neelam_db
CORS_ORIGINS=http://localhost:3000
RAZORPAY_KEY_ID=your_test_key
RAZORPAY_KEY_SECRET=your_test_secret
ADMIN_EMAIL=admin@houseofneelam.com
ADMIN_PASSWORD_HASH=$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYK5H3Q3T5C
EOF
```

**Frontend `.env`:**
```bash
cd ../frontend
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
EOF
```

### 3️⃣ Start MongoDB (30 seconds)

```bash
# Start MongoDB
mongod --dbpath /path/to/your/data
# OR just run: mongod
```

### 4️⃣ Run the Application (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

### 5️⃣ Access the Application

🌐 **Customer Site:** http://localhost:3000
🔐 **Admin Panel:** http://localhost:3000/admin/login

**Admin Login:**
- Email: `admin@houseofneelam.com`
- Password: `admin123`

---

## 📝 Quick Commands Reference

| Task | Command |
|------|---------|
| Start Backend | `cd backend && uvicorn server:app --reload` |
| Start Frontend | `cd frontend && yarn start` |
| Backup Database | `python scripts/backup_db.py` |
| Restore Database | `python scripts/restore_db.py /backups/backup_XXXXXXXX` |
| View API Docs | Open `http://localhost:8001/docs` |
| Run Tests | `cd frontend && yarn test` |

---

## 🎯 First Steps After Setup

1. **Browse Products:** Go to http://localhost:3000/products
2. **Add to Cart:** Click any product and add to cart
3. **Test Checkout:** Use guest checkout with any phone number
4. **Access Admin:** Login at /admin/login with default credentials
5. **Add Product:** Navigate to Admin > Products > Add New

---

## ⚡ Common Quick Fixes

**MongoDB not starting?**
```bash
sudo service mongodb start
# OR
brew services start mongodb-community
```

**Port 3000 already in use?**
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9
```

**Port 8001 already in use?**
```bash
# Kill the process
lsof -ti:8001 | xargs kill -9
```

**Can't connect to database?**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

---

## 📦 Sample Data

The application automatically seeds with 4 sample products on first run:
- Royal Sapphire Ring - $2,499
- Heritage Gold Necklace - $3,999
- Diamond Stud Earrings - $1,899
- Vintage Pearl Bracelet - $899

---

## 🔥 Pro Tips

1. **Hot Reload Enabled:** Both frontend and backend auto-reload on file changes
2. **API Documentation:** FastAPI provides interactive docs at `/docs`
3. **Database GUI:** Use MongoDB Compass for visual database management
4. **Chrome DevTools:** Use React DevTools extension for debugging
5. **Network Tab:** Monitor API calls in browser DevTools

---

## 📞 Need Help?

- **README:** Check `/app/README.md` for detailed documentation
- **Razorpay Setup:** See `RAZORPAY_MIGRATION_GUIDE.md`
- **Database Backup:** Scripts in `/scripts/` folder

---

**Happy Coding! 🎉**
