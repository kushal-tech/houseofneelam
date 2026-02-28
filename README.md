# House of Neelam - Luxury Jewellery E-Commerce Platform

A full-stack, mobile-friendly e-commerce platform for luxury jewellery with elegant design, secure payments, and comprehensive admin management.

![House of Neelam](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.x-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen)

---

## 🌟 Features

### Customer Features
- 🛍️ **Product Catalog:** Browse exquisite jewellery with category filters
- 🛒 **Shopping Cart:** Add, remove, update quantities with persistent cart
- 💳 **Multiple Payment Options:** Stripe/Razorpay integration
- 👤 **Authentication:** Google OAuth + Guest checkout with phone number
- 📦 **Order Tracking:** View order history and status
- 📱 **Mobile Responsive:** Optimized for all devices
- ✨ **Elegant Design:** Sapphire & Gold luxury theme

### Admin Features
- 📊 **Dashboard:** Sales stats, revenue, order analytics
- 📋 **Order Management:** View, update order status
- 📦 **Inventory Management:** Add, edit, delete products
- 🔐 **Secure Authentication:** Email/password admin login
- 🌙 **Dark Theme:** Professional admin interface

---

## 🚀 Tech Stack

### Frontend
- **React** 18.x
- **React Router** v6
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Bcrypt** - Password hashing
- **Python-Multipart** - File uploads
- **Razorpay/Stripe** - Payment processing

### Database
- **MongoDB** - NoSQL database

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Yarn** (v1.22 or higher) - `npm install -g yarn`
- **Git** - [Download](https://git-scm.com/)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/house-of-neelam.git
cd house-of-neelam
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install
```

### 4. Database Setup

**Start MongoDB:**

```bash
# On macOS/Linux:
mongod --dbpath /path/to/your/data/directory

# On Windows:
"C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe" --dbpath "C:\data\db"

# Or use MongoDB Compass GUI
```

**Optional: Restore Sample Data**

```bash
# If you have a backup
cd ..
python scripts/backup_db.py
```

---

## ⚙️ Configuration

### Backend Configuration

Create/Update `.env` file in `/backend/` directory:

```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=house_of_neelam_db

# CORS
CORS_ORIGINS=http://localhost:3000

# Payment Gateway (Choose one)
# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Stripe (Alternative)
STRIPE_API_KEY=your_stripe_api_key

# Admin Credentials
ADMIN_EMAIL=admin@houseofneelam.com
ADMIN_PASSWORD_HASH=$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYK5H3Q3T5C
# Default password: admin123
```

### Frontend Configuration

Create/Update `.env` file in `/frontend/` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend

# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Start FastAPI server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend will be available at: `http://localhost:8001`
API docs: `http://localhost:8001/docs`

### Start Frontend Development Server

```bash
cd frontend

# Start React development server
yarn start
```

Frontend will be available at: `http://localhost:3000`

---

## 📦 Database Backup & Restore

### Create Backup

```bash
# From project root
python scripts/backup_db.py
```

Backups are saved to `/backups/backup_YYYYMMDD_HHMMSS/`

### Restore Backup

```bash
# From project root
python scripts/restore_db.py /backups/backup_YYYYMMDD_HHMMSS
```

---

## 🔑 Default Credentials

### Admin Access
- **URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@houseofneelam.com`
- **Password:** `admin123`

⚠️ **Important:** Change default password in production!

### Test Payment Credentials

**Razorpay Test Mode:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: `123456`

**Stripe Test Mode:**
- Card: `4242 4242 4242 4242`
- CVV: Any 3 digits
- Expiry: Any future date

---

## 📁 Project Structure

```
house-of-neelam/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── payment_razorpay.py    # Razorpay integration helper
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navigation.js
│   │   │   ├── CartDrawer.js
│   │   │   ├── ProductCard.js
│   │   │   └── ui/            # Shadcn UI components
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── pages/             # Page components
│   │   │   ├── Home.js
│   │   │   ├── ProductList.js
│   │   │   ├── ProductDetail.js
│   │   │   ├── Checkout.js
│   │   │   ├── Orders.js
│   │   │   └── admin/         # Admin pages
│   │   ├── App.js             # Main app component
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── .env                   # Frontend environment variables
├── scripts/
│   ├── backup_db.py           # Database backup script
│   └── restore_db.py          # Database restore script
├── backups/                   # Database backups directory
├── design_guidelines.json     # Design system specs
├── RAZORPAY_MIGRATION_GUIDE.md
└── README.md
```

---

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/auth/guest` - Guest checkout
- `GET /api/auth/session` - Google OAuth callback
- `POST /api/orders` - Create order

### Protected Endpoints (Require Authentication)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `GET /api/orders` - Get user orders
- `POST /api/payment/create-session` - Create payment session
- `POST /api/payment/verify` - Verify payment

### Admin Endpoints (Require Admin Role)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/{id}` - Update order status
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product

Full API documentation: `http://localhost:8001/docs`

---

## 🎨 Design System

### Colors
- **Primary (Sapphire):** `#0F1F38`
- **Accent (Gold):** `#D4AF37`
- **Background:** `#FFFFFF` (Customer) / `#0B1121` (Admin)

### Typography
- **Display:** Playfair Display
- **Body:** Manrope
- **Accent:** Cinzel

---

## 🔒 Security Notes

### For Production Deployment:

1. **Change Default Passwords:**
   ```bash
   # Generate new admin password hash
   python -c "import bcrypt; print(bcrypt.hashpw(b'your_new_password', bcrypt.gensalt()).decode())"
   ```

2. **Update Environment Variables:**
   - Use production MongoDB URL
   - Set production payment gateway keys
   - Update CORS origins
   - Use production frontend URL

3. **Enable HTTPS:**
   - Set up SSL certificates
   - Update all URLs to HTTPS

4. **Secure Cookies:**
   - Ensure `secure=True` for production
   - Set appropriate `sameSite` policies

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
yarn test
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB if not running
mongod --dbpath /path/to/data
```

### Port Already in Use
```bash
# Kill process on port 8001 (backend)
lsof -ti:8001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Python Dependencies Error
```bash
# Upgrade pip
pip install --upgrade pip

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Node Modules Error
```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

---

## 📚 Additional Documentation

- **Razorpay Integration:** See `RAZORPAY_MIGRATION_GUIDE.md`
- **Design Guidelines:** See `design_guidelines.json`
- **Auth Testing:** See `auth_testing.md`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues and questions:
- **Email:** info@houseofneelam.com
- **GitHub Issues:** [Create an issue](https://github.com/YOUR_USERNAME/house-of-neelam/issues)

---

## 🙏 Acknowledgments

- Design inspiration from luxury jewellery brands
- Built with modern web technologies
- Icons by Lucide React
- Fonts from Google Fonts

---

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Customer e-commerce features
- Admin management panel
- Payment gateway integration (Stripe/Razorpay)
- Google OAuth & Guest checkout
- Database backup/restore system

---

**Made with ❤️ for House of Neelam**
