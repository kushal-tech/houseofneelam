# Integration Guide for Enhanced Features

## Files Created:
1. `/app/backend/upload_handler.py` - Image upload functionality
2. `/app/backend/enhanced_models.py` - New data models
3. `/app/backend/admin_enhanced_routes.py` - Admin advanced features
4. `/app/backend/customer_enhanced_routes.py` - Customer filters, wishlist, reviews

## Integration Steps:

### 1. Update server.py

Add these imports at the top:
```python
from fastapi.staticfiles import StaticFiles
from upload_handler import router as upload_router
from admin_enhanced_routes import router as admin_enhanced_router, init_db as init_admin_db
from customer_enhanced_routes import router as customer_enhanced_router, init_db as init_customer_db
```

Add after creating the app:
```python
# Initialize enhanced routes with database
init_admin_db(db)
init_customer_db(db)

# Include enhanced routers
app.include_router(upload_router)
app.include_router(admin_enhanced_router)
app.include_router(customer_enhanced_router)

# Serve uploaded images
from pathlib import Path
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
```

### 2. Create uploads directory:
```bash
mkdir -p /app/backend/uploads
```

### 3. Seed initial categories:
```python
# Add to startup_event in server.py
@app.on_event("startup")
async def startup_event():
    # ... existing product seeding code ...
    
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
```

## New API Endpoints:

### Admin Endpoints:
- `POST /api/admin/categories` - Create category
- `GET /api/admin/categories` - Get all categories
- `PUT /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category
- `GET /api/admin/orders/filter` - Advanced order filtering
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/customers/{user_id}/orders` - Customer order history
- `GET /api/admin/analytics/overview` - Business analytics

### Customer Endpoints:
- `GET /api/products/enhanced` - Products with advanced filters
- `GET /api/products/search` - Product search
- `GET /api/categories` - Get all categories
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove/{product_id}` - Remove from wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/reviews` - Create review
- `GET /api/reviews/{product_id}` - Get product reviews

### Upload Endpoints:
- `POST /api/uploads/` - Upload single image
- `POST /api/uploads/multiple` - Upload multiple images
- `GET /api/uploads/{filename}` - Get image
- `DELETE /api/uploads/{filename}` - Delete image

## Database Collections:
- `categories` - Product categories with subcategories
- `wishlist` - User wishlists
- `reviews` - Product reviews and ratings

## Filter Parameters:

### Product Filters (/api/products/enhanced):
- `category` - Filter by category
- `subcategory` - Filter by subcategory
- `min_price` - Minimum price
- `max_price` - Maximum price
- `sort_by` - Sort by (newest, price_low, price_high, popular, rating)
- `search` - Search term
- `in_stock` - Show only in-stock items
- `limit` - Items per page
- `skip` - Pagination offset

### Order Filters (/api/admin/orders/filter):
- `status` - Order status
- `payment_status` - Payment status
- `start_date` - Start date (ISO format)
- `end_date` - End date (ISO format)
- `customer_email` - Customer email
- `min_amount` - Minimum order amount
- `max_amount` - Maximum order amount
- `limit` - Results limit

## Frontend Integration Guide:

### Image Upload Component:
```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(
    `${BACKEND_URL}/api/uploads/`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    }
  );
  
  return response.data.url;
};
```

### Product Filters:
```javascript
const fetchFilteredProducts = async (filters) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('min_price', filters.minPrice);
  if (filters.maxPrice) params.append('max_price', filters.maxPrice);
  if (filters.sortBy) params.append('sort_by', filters.sortBy);
  
  const response = await axios.get(
    `${BACKEND_URL}/api/products/enhanced?${params}`
  );
  return response.data;
};
```

### Wishlist:
```javascript
const addToWishlist = async (productId) => {
  await axios.post(
    `${BACKEND_URL}/api/wishlist/add?product_id=${productId}`,
    {},
    { withCredentials: true }
  );
};
```

## Testing:

1. Test category creation:
```bash
curl -X POST "http://localhost:8001/api/admin/categories" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "New Category", "subcategories": ["Sub1", "Sub2"]}'
```

2. Test product search:
```bash
curl "http://localhost:8001/api/products/search?q=gold"
```

3. Test order filtering:
```bash
curl "http://localhost:8001/api/admin/orders/filter?status=confirmed&min_amount=1000"
```

4. Test image upload:
```bash
curl -X POST "http://localhost:8001/api/uploads/" \\
  -F "file=@/path/to/image.jpg"
```
