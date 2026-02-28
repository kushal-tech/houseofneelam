# House of Neelam - E-Commerce Application

## Overview
A mobile-friendly e-commerce application for House of Neelam jewellery business.

## Core Requirements
1. **Customer-facing App**: Browse products, add to cart, checkout with Razorpay
2. **Admin Panel**: Manage orders, products, categories, view customer history
3. **Authentication**: Google OAuth for customers, Email/Password for admin, Guest checkout with phone
4. **Payment Gateway**: Razorpay (migrated from Stripe)

## What's Been Implemented

### Backend (FastAPI + MongoDB)
- [x] Admin authentication with secure password hashing
- [x] Product CRUD operations
- [x] Order management
- [x] **Razorpay payment integration** (create order, verify payment)
- [x] Enhanced product filtering (category, price, sort, search)
- [x] Categories with subcategories management
- [x] Wishlist API (add/remove/list)
- [x] Reviews API (create/list)
- [x] Customer order history
- [x] Admin analytics/dashboard stats

### Frontend (React + Tailwind CSS)
- [x] Homepage with hero section, featured products
- [x] Product listing with filters sidebar
- [x] Product search with live results
- [x] Product detail page
- [x] Shopping cart (add, remove, persist across sessions)
- [x] **Checkout with Razorpay payment modal**
- [x] Order success page
- [x] User orders page
- [x] Wishlist page
- [x] Admin login
- [x] Admin dashboard with stats
- [x] Admin orders management
- [x] Admin products management
- [x] Admin categories management
- [x] Google OAuth integration
- [x] Guest checkout with phone/email

### Payment Flow (Razorpay)
1. User adds items to cart
2. User proceeds to checkout
3. Backend creates Razorpay order
4. Frontend opens Razorpay payment modal
5. After payment, backend verifies signature
6. Order status updated to confirmed

## Admin Credentials
- Email: admin@houseofneelam.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/auth/session` - Google OAuth callback
- `POST /api/auth/guest` - Guest login with phone
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List products
- `GET /api/products/enhanced` - List with filters
- `GET /api/products/search` - Search products
- `GET /api/products/{id}` - Get product
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/orders/{id}` - Get order
- `GET /api/admin/orders` - All orders (admin)
- `PUT /api/admin/orders/{id}` - Update order status

### Payments (Razorpay)
- `POST /api/razorpay/create-order` - Create Razorpay order
- `POST /api/razorpay/verify` - Verify payment signature
- `GET /api/razorpay/status/{id}` - Get payment status

### Categories
- `GET /api/categories` - List categories
- `GET /api/admin/categories` - Admin categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category

### Wishlist & Reviews
- `GET /api/wishlist` - User's wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove/{id}` - Remove from wishlist
- `GET /api/reviews/{product_id}` - Product reviews
- `POST /api/reviews` - Create review

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn/UI, Axios
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **Database**: MongoDB
- **Payment**: Razorpay
- **Auth**: JWT sessions, Google OAuth

## Testing Status
- Backend: 100% (15/15 tests passed)
- Frontend: 100%
- Razorpay Integration: Verified working

---
*Last Updated: Feb 28, 2026*
