from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Enhanced Product Model with categories and subcategories
class ProductEnhanced(BaseModel):
    product_id: str
    name: str
    description: str
    price: float
    images: List[str]
    category: str
    subcategory: Optional[str] = None
    stock: int
    rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0
    tags: Optional[List[str]] = []
    weight: Optional[str] = None
    material: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ProductCreateEnhanced(BaseModel):
    name: str
    description: str
    price: float
    images: List[str]
    category: str
    subcategory: Optional[str] = None
    stock: int
    tags: Optional[List[str]] = []
    weight: Optional[str] = None
    material: Optional[str] = None

class ProductUpdateEnhanced(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    images: Optional[List[str]] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    stock: Optional[int] = None
    tags: Optional[List[str]] = None
    weight: Optional[str] = None
    material: Optional[str] = None

# Category Model
class Category(BaseModel):
    category_id: str
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    subcategories: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    subcategories: Optional[List[str]] = []

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    subcategories: Optional[List[str]] = None

# Wishlist Model
class WishlistItem(BaseModel):
    user_id: str
    product_id: str
    added_at: datetime

# Review Model  
class Review(BaseModel):
    review_id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int  # 1-5
    comment: str
    created_at: datetime

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str