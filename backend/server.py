from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Header
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import httpx
import razorpay

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay setup
RAZORPAY_KEY_ID = os.environ['RAZORPAY_KEY_ID']
RAZORPAY_KEY_SECRET = os.environ['RAZORPAY_KEY_SECRET']
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import and initialize enhanced routes
try:
    from upload_handler import router as upload_router
    from admin_enhanced_routes import router as admin_enhanced_router, init_db as init_admin_db
    from customer_enhanced_routes import router as customer_enhanced_router, init_db as init_customer_db
    
    # Initialize with database
    init_admin_db(db)
    init_customer_db(db)
    
    # Include routers
    app.include_router(upload_router, prefix="/api")
    app.include_router(admin_enhanced_router)
    app.include_router(customer_enhanced_router)
    
    logger.info("Enhanced features loaded successfully")
except Exception as e:
    logger.warning(f"Enhanced features not loaded: {e}")

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "customer"
    phone: Optional[str] = None
    created_at: datetime

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class GuestAuthRequest(BaseModel):
    phone: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    name: str
    description: str
    price: float
    images: List[str]
    category: str
    stock: int
    created_at: datetime
    updated_at: datetime

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    images: List[str]
    category: str
    stock: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    images: Optional[List[str]] = None
    category: Optional[str] = None
    stock: Optional[int] = None

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str
    user_id: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_email: Optional[str] = None
    items: List[OrderItem]
    total_amount: float
    status: str
    payment_status: str
    session_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class OrderCreate(BaseModel):
    items: List[OrderItem]
    guest_phone: Optional[str] = None
    guest_email: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str

class CheckoutRequest(BaseModel):
    order_id: str
    origin_url: str

# ============ AUTH HELPERS ============

async def get_current_user(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)) -> Optional[User]:
    """Extract user from session_token (cookie first, then Authorization header)"""
    token = session_token or (authorization.replace('Bearer ', '') if authorization else None)
    if not token:
        return None
    
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

async def get_admin_user(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)) -> User:
    user = await get_current_user(authorization, session_token)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============ AUTH ROUTES ============

@api_router.post("/admin/login")
async def admin_login(request: AdminLoginRequest, response: Response):
    """Admin login with email/password"""
    admin_email = os.environ.get('ADMIN_EMAIL')
    admin_password_hash = os.environ.get('ADMIN_PASSWORD_HASH')
    
    if request.email != admin_email:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(request.password.encode(), admin_password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if admin user exists
    admin_user = await db.users.find_one({"email": admin_email}, {"_id": 0})
    if not admin_user:
        # Create admin user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        admin_user = {
            "user_id": user_id,
            "email": admin_email,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(admin_user.copy())
    else:
        user_id = admin_user["user_id"]
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    return {"user_id": user_id, "email": admin_email, "name": "Admin", "role": "admin"}

@api_router.get("/auth/session")
async def process_session(session_id: str, response: Response):
    """Process Emergent OAuth session_id and create user session"""
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    async with httpx.AsyncClient() as http_client:
        auth_response = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_data = auth_response.json()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": user_data["name"], "picture": user_data["picture"]}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data["picture"],
            "role": "customer",
            "created_at": datetime.now(timezone.utc)
        })
    
    # Create session using session_token from Emergent
    session_token = user_data["session_token"]
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    return {"user_id": user_id, "email": user_data["email"], "name": user_data["name"], "role": "customer"}

@api_router.post("/auth/guest")
async def guest_auth(request: GuestAuthRequest, response: Response):
    """Guest authentication with phone number"""
    guest_user = await db.users.find_one({"phone": request.phone, "role": "guest"}, {"_id": 0})
    
    if guest_user:
        user_id = guest_user["user_id"]
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "phone": request.phone,
            "email": f"guest_{user_id}@houseofneelam.com",
            "name": "Guest",
            "role": "guest",
            "created_at": datetime.now(timezone.utc)
        })
    
    session_token = f"session_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    return {"user_id": user_id, "phone": request.phone, "role": "guest"}

@api_router.get("/auth/me")
async def get_me(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out successfully"}

# ============ PRODUCT ROUTES ============

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {"stock": {"$gt": 0}}
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product['created_at'], str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product['updated_at'], str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product['created_at'], str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product['updated_at'], str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    return Product(**product)

@api_router.post("/admin/products", response_model=Product)
async def create_product(product: ProductCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(authorization, session_token)
    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    product_data = product.model_dump()
    product_data.update({
        "product_id": product_id,
        "created_at": now,
        "updated_at": now
    })
    await db.products.insert_one(product_data.copy())
    return Product(**product_data)

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductUpdate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(authorization, session_token)
    existing = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.products.update_one({"product_id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated['updated_at'], str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return Product(**updated)

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(authorization, session_token)
    result = await db.products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ============ ORDER ROUTES ============

@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    total_amount = sum(item.price * item.quantity for item in order.items)
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    order_data = {
        "order_id": order_id,
        "user_id": user.user_id if user else None,
        "guest_phone": order.guest_phone,
        "guest_email": order.guest_email,
        "items": [item.model_dump() for item in order.items],
        "total_amount": total_amount,
        "status": "pending",
        "payment_status": "pending",
        "created_at": now,
        "updated_at": now
    }
    
    await db.orders.insert_one(order_data.copy())
    return Order(**order_data)

@api_router.get("/orders", response_model=List[Order])
async def get_user_orders(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    orders = await db.orders.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order['updated_at'], str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if user and user.role != "admin" and order.get("user_id") != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order['updated_at'], str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return Order(**order)

@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(authorization, session_token)
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order['updated_at'], str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return orders

@api_router.put("/admin/orders/{order_id}")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(authorization, session_token)
    result = await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": status_update.status, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order updated successfully"}

# ============ RAZORPAY PAYMENT ROUTES ============

class RazorpayOrderRequest(BaseModel):
    order_id: str

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@api_router.post("/razorpay/create-order")
async def create_razorpay_order(request: RazorpayOrderRequest):
    """Create a Razorpay order for payment"""
    order = await db.orders.find_one({"order_id": request.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Convert amount to paise (Razorpay uses smallest currency unit)
    amount_in_paise = int(order["total_amount"] * 100)
    
    try:
        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": order["order_id"][:40],
            "payment_capture": 1
        })
        
        # Create payment transaction
        transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
        await db.payment_transactions.insert_one({
            "transaction_id": transaction_id,
            "razorpay_order_id": razorpay_order["id"],
            "order_id": order["order_id"],
            "amount": order["total_amount"],
            "currency": "INR",
            "status": "created",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc)
        })
        
        # Update order with razorpay_order_id
        await db.orders.update_one(
            {"order_id": order["order_id"]},
            {"$set": {"razorpay_order_id": razorpay_order["id"]}}
        )
        
        return {
            "razorpay_order_id": razorpay_order["id"],
            "razorpay_key_id": RAZORPAY_KEY_ID,
            "amount": amount_in_paise,
            "currency": "INR",
            "order_id": order["order_id"]
        }
    except Exception as e:
        logger.error(f"Razorpay order creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")

@api_router.post("/razorpay/verify")
async def verify_razorpay_payment(payment_data: RazorpayVerifyRequest):
    """Verify Razorpay payment signature"""
    try:
        # Verify signature
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment_data.razorpay_order_id,
            'razorpay_payment_id': payment_data.razorpay_payment_id,
            'razorpay_signature': payment_data.razorpay_signature
        })
        
        # Update transaction
        transaction = await db.payment_transactions.find_one(
            {"razorpay_order_id": payment_data.razorpay_order_id}, 
            {"_id": 0}
        )
        
        if transaction:
            await db.payment_transactions.update_one(
                {"razorpay_order_id": payment_data.razorpay_order_id},
                {"$set": {
                    "razorpay_payment_id": payment_data.razorpay_payment_id,
                    "razorpay_signature": payment_data.razorpay_signature,
                    "status": "complete",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            # Update order
            await db.orders.update_one(
                {"razorpay_order_id": payment_data.razorpay_order_id},
                {"$set": {
                    "payment_status": "paid",
                    "status": "confirmed",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
        
        # Get updated order
        order = await db.orders.find_one(
            {"razorpay_order_id": payment_data.razorpay_order_id}, 
            {"_id": 0}
        )
        
        return {
            "status": "success", 
            "message": "Payment verified successfully",
            "order_id": order["order_id"] if order else None
        }
        
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        logger.error(f"Payment verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment verification failed")

@api_router.get("/razorpay/status/{razorpay_order_id}")
async def get_razorpay_payment_status(razorpay_order_id: str):
    """Get payment status by Razorpay order ID"""
    transaction = await db.payment_transactions.find_one(
        {"razorpay_order_id": razorpay_order_id}, 
        {"_id": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "status": transaction.get("status"),
        "payment_status": transaction.get("payment_status"),
        "amount": transaction.get("amount"),
        "currency": transaction.get("currency"),
        "razorpay_order_id": razorpay_order_id
    }

# ============ ADMIN DASHBOARD ============

@api_router.get("/admin/dashboard/stats")
async def get_dashboard_stats(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(authorization, session_token)
    
    total_orders = await db.orders.count_documents({})
    total_revenue = await db.orders.aggregate([
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]).to_list(1)
    
    pending_orders = await db.orders.count_documents({"status": "pending"})
    total_products = await db.products.count_documents({})
    low_stock = await db.products.count_documents({"stock": {"$lt": 10}})
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue[0]["total"] if total_revenue else 0,
        "pending_orders": pending_orders,
        "total_products": total_products,
        "low_stock_items": low_stock
    }

# ============ STARTUP - SEED DATA ============

@app.on_event("startup")
async def startup_event():
    # Check if products exist
    product_count = await db.products.count_documents({})
    if product_count == 0:
        logger.info("Seeding database with sample products...")
        sample_products = [
            {
                "product_id": f"prod_{uuid.uuid4().hex[:12]}",
                "name": "Royal Sapphire Ring",
                "description": "Exquisite 18K gold ring featuring a stunning blue sapphire centerpiece, surrounded by brilliant diamonds. A timeless piece for special occasions.",
                "price": 2499.00,
                "images": ["https://images.unsplash.com/photo-1763256614634-7feb3ff79ff3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnb2xkJTIwZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjAyMTM1OHww&ixlib=rb-4.1.0&q=85"],
                "category": "Rings",
                "stock": 5,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "product_id": f"prod_{uuid.uuid4().hex[:12]}",
                "name": "Heritage Gold Necklace",
                "description": "Elegant layered gold necklace with intricate traditional patterns. Perfect for weddings and celebrations.",
                "price": 3999.00,
                "images": ["https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
                "category": "Necklaces",
                "stock": 3,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "product_id": f"prod_{uuid.uuid4().hex[:12]}",
                "name": "Diamond Stud Earrings",
                "description": "Classic diamond stud earrings set in 18K white gold. A versatile addition to any jewellery collection.",
                "price": 1899.00,
                "images": ["https://images.unsplash.com/photo-1765614765034-ab49d03d4c28?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBnb2xkJTIwZGlhbW9uZCUyMHJpbmclMjBqZXdlbHJ5fGVufDB8fHx8MTc3MjAyMTM1OHww&ixlib=rb-4.1.0&q=85"],
                "category": "Earrings",
                "stock": 8,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "product_id": f"prod_{uuid.uuid4().hex[:12]}",
                "name": "Vintage Pearl Bracelet",
                "description": "Delicate pearl bracelet with gold clasp. Timeless elegance for everyday wear.",
                "price": 899.00,
                "images": ["https://images.pexels.com/photos/8901265/pexels-photo-8901265.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
                "category": "Bracelets",
                "stock": 12,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        await db.products.insert_many(sample_products)
        logger.info(f"Seeded {len(sample_products)} products")
    
    # Seed categories
    category_count = await db.categories.count_documents({})
    if category_count == 0:
        logger.info("Seeding categories...")
        sample_categories = [
            {
                "category_id": f"cat_{uuid.uuid4().hex[:12]}",
                "name": "Rings",
                "slug": "rings",
                "description": "Exquisite rings for every occasion",
                "subcategories": ["Engagement Rings", "Wedding Bands", "Fashion Rings", "Cocktail Rings"],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "category_id": f"cat_{uuid.uuid4().hex[:12]}",
                "name": "Necklaces",
                "slug": "necklaces",
                "description": "Beautiful necklaces and pendants",
                "subcategories": ["Pendant Necklaces", "Chain Necklaces", "Statement Necklaces", "Pearl Necklaces"],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "category_id": f"cat_{uuid.uuid4().hex[:12]}",
                "name": "Earrings",
                "slug": "earrings",
                "description": "Elegant earrings collection",
                "subcategories": ["Stud Earrings", "Drop Earrings", "Hoop Earrings", "Chandelier Earrings"],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "category_id": f"cat_{uuid.uuid4().hex[:12]}",
                "name": "Bracelets",
                "slug": "bracelets",
                "description": "Stunning bracelets and bangles",
                "subcategories": ["Tennis Bracelets", "Charm Bracelets", "Bangles", "Cuff Bracelets"],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        await db.categories.insert_many(sample_categories)
        logger.info(f"Seeded {len(sample_categories)} categories")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()