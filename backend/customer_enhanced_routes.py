from fastapi import APIRouter, HTTPException, Query, Cookie, Header
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from enhanced_models import *

# This will be initialized from main server.py
db = None

router = APIRouter(prefix="/api", tags=["customer"])

def init_db(database):
    global db
    db = database

# ============ ENHANCED PRODUCT LISTING WITH FILTERS ============

@router.get("/products/enhanced")
async def get_products_enhanced(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = Query("newest", regex="^(newest|price_low|price_high|popular|rating)$"),
    search: Optional[str] = None,
    in_stock: Optional[bool] = None,
    limit: int = Query(50, le=100),
    skip: int = 0
):
    """Enhanced product listing with advanced filters"""
    query = {}
    
    # Category filter
    if category:
        query["category"] = category
    if subcategory:
        query["subcategory"] = subcategory
    
    # Price filter
    if min_price or max_price:
        query["price"] = {}
        if min_price:
            query["price"]["$gte"] = min_price
        if max_price:
            query["price"]["$lte"] = max_price
    
    # Stock filter
    if in_stock:
        query["stock"] = {"$gt": 0}
    
    # Search filter
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search]}}
        ]
    
    # Sorting
    sort_options = {
        "newest": ("created_at", -1),
        "price_low": ("price", 1),
        "price_high": ("price", -1),
        "popular": ("reviews_count", -1),
        "rating": ("rating", -1)
    }
    sort_field, sort_order = sort_options.get(sort_by, ("created_at", -1))
    
    # Get products
    products = await db.products.find(query, {"_id": 0}).sort(sort_field, sort_order).skip(skip).limit(limit).to_list(limit)
    
    # Get total count for pagination
    total_count = await db.products.count_documents(query)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product.get('updated_at'), str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return {
        "products": products,
        "total": total_count,
        "page": skip // limit + 1,
        "pages": (total_count + limit - 1) // limit,
        "filters_applied": query
    }

# ============ PRODUCT SEARCH ============

@router.get("/products/search")
async def search_products(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, le=50)
):
    """Search products by name, description, or tags"""
    query = {
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}}
        ]
    }
    
    products = await db.products.find(query, {"_id": 0}).limit(limit).to_list(limit)
    
    return {
        "results": products,
        "count": len(products),
        "query": q
    }

# ============ WISHLIST ============

@router.post("/wishlist/add")
async def add_to_wishlist(
    product_id: str,
    authorization: Optional[str] = Header(None),
    session_token: Optional[str] = Cookie(None)
):
    """Add product to wishlist"""
    # Get user from session
    from server import get_current_user
    user = await get_current_user(authorization, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if product exists
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already in wishlist
    existing = await db.wishlist.find_one({
        "user_id": user.user_id,
        "product_id": product_id
    })
    
    if existing:
        return {"message": "Already in wishlist"}
    
    # Add to wishlist
    await db.wishlist.insert_one({
        "user_id": user.user_id,
        "product_id": product_id,
        "added_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Added to wishlist"}

@router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    authorization: Optional[str] = Header(None),
    session_token: Optional[str] = Cookie(None)
):
    """Remove product from wishlist"""
    from server import get_current_user
    user = await get_current_user(authorization, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.wishlist.delete_one({
        "user_id": user.user_id,
        "product_id": product_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not in wishlist")
    
    return {"message": "Removed from wishlist"}

@router.get("/wishlist")
async def get_wishlist(
    authorization: Optional[str] = Header(None),
    session_token: Optional[str] = Cookie(None)
):
    """Get user's wishlist with product details"""
    from server import get_current_user
    user = await get_current_user(authorization, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get wishlist items
    wishlist_items = await db.wishlist.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    # Get product details
    product_ids = [item["product_id"] for item in wishlist_items]
    products = await db.products.find({"product_id": {"$in": product_ids}}, {"_id": 0}).to_list(1000)
    
    # Combine with added_at timestamps
    wishlist_with_details = []
    for item in wishlist_items:
        product = next((p for p in products if p["product_id"] == item["product_id"]), None)
        if product:
            wishlist_with_details.append({
                **product,
                "added_at": item["added_at"]
            })
    
    return wishlist_with_details

# ============ PRODUCT REVIEWS ============

@router.post("/reviews")
async def create_review(
    review: ReviewCreate,
    authorization: Optional[str] = Header(None),
    session_token: Optional[str] = Cookie(None)
):
    """Create a product review"""
    from server import get_current_user
    user = await get_current_user(authorization, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Validate rating
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if product exists
    product = await db.products.find_one({"product_id": review.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed
    existing = await db.reviews.find_one({
        "product_id": review.product_id,
        "user_id": user.user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    # Create review
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    review_data = {
        "review_id": review_id,
        "product_id": review.product_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.reviews.insert_one(review_data.copy())
    
    # Update product rating
    all_reviews = await db.reviews.find({"product_id": review.product_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    
    await db.products.update_one(
        {"product_id": review.product_id},
        {"$set": {
            "rating": round(avg_rating, 1),
            "reviews_count": len(all_reviews)
        }}
    )
    
    return Review(**review_data)

@router.get("/reviews/{product_id}")
async def get_product_reviews(product_id: str):
    """Get all reviews for a product"""
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for review in reviews:
        if isinstance(review['created_at'], str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    
    return reviews

# ============ CATEGORIES (PUBLIC) ============

@router.get("/categories")
async def get_all_categories():
    """Get all categories for customer browsing"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return categories
