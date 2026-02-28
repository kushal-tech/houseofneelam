from fastapi import APIRouter, HTTPException, Query, Cookie, Header
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from enhanced_models import *
import os

# This will be initialized from main server.py
db = None

router = APIRouter(prefix="/api/admin", tags=["admin"])

def init_db(database):
    global db
    db = database

# ============ CATEGORIES MANAGEMENT ============

@router.get("/categories")
async def get_categories():
    """Get all categories with subcategories"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat['created_at'], str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
        if isinstance(cat['updated_at'], str):
            cat['updated_at'] = datetime.fromisoformat(cat['updated_at'])
    return categories

@router.post("/categories")
async def create_category(category: CategoryCreate):
    """Create new category"""
    category_id = f"cat_{uuid.uuid4().hex[:12]}"
    slug = category.name.lower().replace(" ", "-")
    now = datetime.now(timezone.utc)
    
    category_data = category.model_dump()
    category_data.update({
        "category_id": category_id,
        "slug": slug,
        "created_at": now,
        "updated_at": now
    })
    
    await db.categories.insert_one(category_data.copy())
    return Category(**category_data)

@router.put("/categories/{category_id}")
async def update_category(category_id: str, category: CategoryUpdate):
    """Update category"""
    update_data = {k: v for k, v in category.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.categories.update_one(
        {"category_id": category_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated = await db.categories.find_one({"category_id": category_id}, {"_id": 0})
    return updated

@router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    """Delete category"""
    result = await db.categories.delete_one({"category_id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# ============ ADVANCED ORDER FILTERING ============

@router.get("/orders/filter")
async def filter_orders(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_email: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    limit: int = Query(50, le=100)
):
    """Advanced order filtering"""
    query = {}
    
    if status:
        query["status"] = status
    if payment_status:
        query["payment_status"] = payment_status
    if customer_email:
        query["$or"] = [
            {"user_id": {"$regex": customer_email, "$options": "i"}},
            {"guest_email": {"$regex": customer_email, "$options": "i"}}
        ]
    if min_amount or max_amount:
        query["total_amount"] = {}
        if min_amount:
            query["total_amount"]["$gte"] = min_amount
        if max_amount:
            query["total_amount"]["$lte"] = max_amount
    if start_date:
        if "created_at" not in query:
            query["created_at"] = {}
        query["created_at"]["$gte"] = datetime.fromisoformat(start_date)
    if end_date:
        if "created_at" not in query:
            query["created_at"] = {}
        query["created_at"]["$lte"] = datetime.fromisoformat(end_date)
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order['updated_at'], str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    return {
        "orders": orders,
        "count": len(orders),
        "filters_applied": query
    }

# ============ CUSTOMER ORDER HISTORY ============

@router.get("/customers/{user_id}/orders")
async def get_customer_orders(user_id: str):
    """Get all orders for a specific customer"""
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order['updated_at'], str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    # Get customer info
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    # Calculate stats
    total_spent = sum(order['total_amount'] for order in orders if order.get('payment_status') == 'paid')
    total_orders = len(orders)
    
    return {
        "customer": user,
        "orders": orders,
        "statistics": {
            "total_orders": total_orders,
            "total_spent": total_spent,
            "average_order_value": total_spent / total_orders if total_orders > 0 else 0
        }
    }

@router.get("/customers")
async def get_all_customers():
    """Get all customers with order statistics"""
    customers = await db.users.find({"role": {"$in": ["customer", "guest"]}}, {"_id": 0}).to_list(1000)
    
    customer_list = []
    for customer in customers:
        orders = await db.orders.find({"user_id": customer['user_id']}, {"_id": 0}).to_list(1000)
        total_spent = sum(order['total_amount'] for order in orders if order.get('payment_status') == 'paid')
        
        customer_list.append({
            "user_id": customer['user_id'],
            "name": customer.get('name', 'Guest'),
            "email": customer.get('email', ''),
            "phone": customer.get('phone', ''),
            "total_orders": len(orders),
            "total_spent": total_spent,
            "last_order": orders[0]['created_at'] if orders else None
        })
    
    return customer_list

# ============ ANALYTICS ============

@router.get("/analytics/overview")
async def get_analytics_overview(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get business analytics overview"""
    query = {}
    if start_date or end_date:
        query["created_at"] = {}
        if start_date:
            query["created_at"]["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            query["created_at"]["$lte"] = datetime.fromisoformat(end_date)
    
    # Orders statistics
    all_orders = await db.orders.find(query, {"_id": 0}).to_list(10000)
    paid_orders = [o for o in all_orders if o.get('payment_status') == 'paid']
    
    total_revenue = sum(order['total_amount'] for order in paid_orders)
    avg_order_value = total_revenue / len(paid_orders) if paid_orders else 0
    
    # Top products
    product_sales = {}
    for order in paid_orders:
        for item in order['items']:
            pid = item['product_id']
            if pid not in product_sales:
                product_sales[pid] = {"name": item['name'], "quantity": 0, "revenue": 0}
            product_sales[pid]["quantity"] += item['quantity']
            product_sales[pid]["revenue"] += item['price'] * item['quantity']
    
    top_products = sorted(product_sales.items(), key=lambda x: x[1]['revenue'], reverse=True)[:10]
    
    return {
        "total_orders": len(all_orders),
        "paid_orders": len(paid_orders),
        "total_revenue": total_revenue,
        "average_order_value": avg_order_value,
        "top_products": [{"product_id": k, **v} for k, v in top_products],
        "status_breakdown": {
            "pending": len([o for o in all_orders if o['status'] == 'pending']),
            "confirmed": len([o for o in all_orders if o['status'] == 'confirmed']),
            "shipped": len([o for o in all_orders if o['status'] == 'shipped']),
            "delivered": len([o for o in all_orders if o['status'] == 'delivered'])
        }
    }
