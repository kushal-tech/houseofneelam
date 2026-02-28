"""
Backend API Tests for House of Neelam E-commerce
Tests: Products, Categories, Orders, Admin, Razorpay
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://neelam-ecommerce.preview.emergentagent.com').rstrip('/')


class TestPublicAPIs:
    """Tests for public (no auth required) endpoints"""
    
    def test_get_products_basic(self):
        """Test basic products listing"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list)
        if len(products) > 0:
            assert "product_id" in products[0]
            assert "name" in products[0]
            assert "price" in products[0]
            print(f"SUCCESS: Found {len(products)} products")
    
    def test_get_products_enhanced(self):
        """Test enhanced products listing with filters"""
        response = requests.get(f"{BASE_URL}/api/products/enhanced")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "total" in data
        print(f"SUCCESS: Enhanced products endpoint returns {data['total']} products")
    
    def test_get_products_with_category_filter(self):
        """Test products filtering by category"""
        response = requests.get(f"{BASE_URL}/api/products/enhanced?category=Rings")
        assert response.status_code == 200
        data = response.json()
        # All returned products should be rings
        for product in data["products"]:
            assert product["category"] == "Rings"
        print(f"SUCCESS: Category filter works, found {len(data['products'])} Rings")
    
    def test_product_search(self):
        """Test product search functionality"""
        response = requests.get(f"{BASE_URL}/api/products/search?q=ring")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "count" in data
        print(f"SUCCESS: Search found {data['count']} products for 'ring'")
    
    def test_get_categories(self):
        """Test categories listing"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        categories = response.json()
        assert isinstance(categories, list)
        if len(categories) > 0:
            assert "category_id" in categories[0]
            assert "name" in categories[0]
            assert "subcategories" in categories[0]
        print(f"SUCCESS: Found {len(categories)} categories")


class TestAdminAuthentication:
    """Tests for admin login and authenticated endpoints"""
    
    @pytest.fixture
    def admin_session(self):
        """Login as admin and return session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": "admin@houseofneelam.com", "password": "admin123"}
        )
        if response.status_code == 200:
            return session
        pytest.skip("Admin login failed")
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": "admin@houseofneelam.com", "password": "admin123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@houseofneelam.com"
        assert data["role"] == "admin"
        print("SUCCESS: Admin login works correctly")
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with wrong credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": "admin@houseofneelam.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("SUCCESS: Invalid credentials correctly rejected")
    
    def test_admin_dashboard_stats(self, admin_session):
        """Test admin dashboard stats endpoint"""
        response = admin_session.get(f"{BASE_URL}/api/admin/dashboard/stats")
        assert response.status_code == 200
        stats = response.json()
        assert "total_orders" in stats
        assert "total_revenue" in stats
        assert "pending_orders" in stats
        assert "total_products" in stats
        print(f"SUCCESS: Dashboard stats - Orders: {stats['total_orders']}, Revenue: ${stats['total_revenue']}")
    
    def test_admin_categories_list(self, admin_session):
        """Test admin categories listing"""
        response = admin_session.get(f"{BASE_URL}/api/admin/categories")
        assert response.status_code == 200
        categories = response.json()
        assert isinstance(categories, list)
        print(f"SUCCESS: Admin categories returns {len(categories)} categories")
    
    def test_admin_orders_list(self, admin_session):
        """Test admin orders listing"""
        response = admin_session.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 200
        orders = response.json()
        assert isinstance(orders, list)
        print(f"SUCCESS: Admin orders returns {len(orders)} orders")


class TestOrderFlow:
    """Tests for order creation and management"""
    
    def test_create_order_guest(self):
        """Test creating an order as guest"""
        # First get a product ID
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        assert len(products) > 0, "No products available for testing"
        
        product = products[0]
        test_order = {
            "items": [{
                "product_id": product["product_id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": 1,
                "image": product["images"][0] if product["images"] else "test.jpg"
            }],
            "guest_email": f"test_{uuid.uuid4().hex[:6]}@test.com",
            "guest_phone": "9876543210"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/orders",
            json=test_order
        )
        assert response.status_code == 200
        order = response.json()
        assert "order_id" in order
        assert order["status"] == "pending"
        assert order["payment_status"] == "pending"
        assert order["total_amount"] == product["price"]
        print(f"SUCCESS: Guest order created - {order['order_id']}")
        return order["order_id"]
    
    def test_get_order_by_id(self):
        """Test getting order by ID - Create and retrieve"""
        # Create order first
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product = products[0]
        
        create_response = requests.post(
            f"{BASE_URL}/api/orders",
            json={
                "items": [{
                    "product_id": product["product_id"],
                    "name": product["name"],
                    "price": product["price"],
                    "quantity": 1,
                    "image": "test.jpg"
                }],
                "guest_email": "verify@test.com",
                "guest_phone": "1234567890"
            }
        )
        order = create_response.json()
        order_id = order["order_id"]
        
        # Retrieve the order
        get_response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert get_response.status_code == 200
        retrieved_order = get_response.json()
        assert retrieved_order["order_id"] == order_id
        print(f"SUCCESS: Order {order_id} retrieved successfully")


class TestRazorpayIntegration:
    """Tests for Razorpay payment gateway integration"""
    
    def test_create_razorpay_order(self):
        """Test Razorpay order creation"""
        # First create a regular order
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product = products[0]
        
        order_response = requests.post(
            f"{BASE_URL}/api/orders",
            json={
                "items": [{
                    "product_id": product["product_id"],
                    "name": product["name"],
                    "price": product["price"],
                    "quantity": 1,
                    "image": "test.jpg"
                }],
                "guest_email": "razorpay_test@test.com",
                "guest_phone": "9999999999"
            }
        )
        order = order_response.json()
        
        # Create Razorpay order
        razorpay_response = requests.post(
            f"{BASE_URL}/api/razorpay/create-order",
            json={"order_id": order["order_id"]}
        )
        assert razorpay_response.status_code == 200
        razorpay_data = razorpay_response.json()
        
        assert "razorpay_order_id" in razorpay_data
        assert "razorpay_key_id" in razorpay_data
        assert razorpay_data["razorpay_key_id"] == "rzp_test_SLVXTd12dTdLEA"
        assert "amount" in razorpay_data
        assert razorpay_data["currency"] == "INR"
        # Amount should be in paise (smallest currency unit)
        expected_amount = int(product["price"] * 100)
        assert razorpay_data["amount"] == expected_amount
        print(f"SUCCESS: Razorpay order created - {razorpay_data['razorpay_order_id']}, Amount: {razorpay_data['amount']} paise")
    
    def test_razorpay_order_for_nonexistent_order(self):
        """Test Razorpay order creation fails for invalid order"""
        response = requests.post(
            f"{BASE_URL}/api/razorpay/create-order",
            json={"order_id": "order_nonexistent123"}
        )
        assert response.status_code == 404
        print("SUCCESS: Razorpay correctly rejects invalid order IDs")


class TestGuestAuthentication:
    """Tests for guest authentication flow"""
    
    def test_guest_auth_with_phone(self):
        """Test guest authentication with phone number"""
        response = requests.post(
            f"{BASE_URL}/api/auth/guest",
            json={"phone": f"+1{uuid.uuid4().hex[:10]}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert data["role"] == "guest"
        print(f"SUCCESS: Guest auth works - User ID: {data['user_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
