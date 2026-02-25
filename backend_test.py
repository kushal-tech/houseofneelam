#!/usr/bin/env python3
"""
House of Neelam - Backend API Testing
Tests all backend endpoints for the jewellery e-commerce application
"""

import requests
import sys
import json
from datetime import datetime

class HouseOfNeelamTester:
    def __init__(self, base_url="https://neelam-commerce.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.admin_token = None
        self.guest_session = None
        self.test_product_id = None
        self.test_order_id = None
        self.tests_run = 0
        self.tests_passed = 0
        
        print(f"🏠 House of Neelam Backend Tester")
        print(f"📡 Testing against: {self.api_base}")
        print("=" * 60)

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, cookies=None):
        """Run a single API test"""
        url = f"{self.api_base}/{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        if headers:
            request_headers.update(headers)
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   {method} {endpoint}")
        
        try:
            kwargs = {
                'headers': request_headers,
                'timeout': 30
            }
            
            if cookies:
                kwargs['cookies'] = cookies
                
            if method == 'GET':
                response = requests.get(url, **kwargs)
            elif method == 'POST':
                response = requests.post(url, json=data, **kwargs)
            elif method == 'PUT':
                response = requests.put(url, json=data, **kwargs)
            elif method == 'DELETE':
                response = requests.delete(url, **kwargs)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin authentication"""
        print("\n" + "="*50)
        print("🔐 TESTING ADMIN AUTHENTICATION")
        print("="*50)
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={
                "email": "admin@houseofneelam.com",
                "password": "admin123"
            }
        )
        
        if success and response.get('role') == 'admin':
            print(f"🎉 Admin login successful for: {response.get('email')}")
            return True
        return False

    def test_guest_auth(self):
        """Test guest authentication with phone"""
        print("\n" + "="*50)
        print("📱 TESTING GUEST AUTHENTICATION")
        print("="*50)
        
        test_phone = f"555012{datetime.now().strftime('%M%S')}"
        
        success, response = self.run_test(
            "Guest Authentication",
            "POST",
            "auth/guest",
            200,
            data={"phone": test_phone}
        )
        
        if success and response.get('role') == 'guest':
            print(f"🎉 Guest auth successful for phone: {test_phone}")
            return True
        return False

    def test_products_api(self):
        """Test product-related endpoints"""
        print("\n" + "="*50)
        print("💎 TESTING PRODUCTS API")
        print("="*50)
        
        # Test get all products
        success1, products = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        
        # Test get products by category
        success2, category_products = self.run_test(
            "Get Products by Category",
            "GET",
            "products?category=Rings",
            200
        )
        
        # Test get single product (if products exist)
        success3 = False
        if success1 and products:
            product_id = products[0]['product_id']
            self.test_product_id = product_id
            success3, product = self.run_test(
                "Get Single Product",
                "GET",
                f"products/{product_id}",
                200
            )
            
            if success3:
                print(f"   📦 Product: {product.get('name', 'Unknown')}")
                print(f"   💰 Price: ${product.get('price', 0):.2f}")
        
        return success1 and success2 and (success3 or not products)

    def test_admin_products_management(self):
        """Test admin product management (requires admin session)"""
        print("\n" + "="*50)
        print("🛠️  TESTING ADMIN PRODUCT MANAGEMENT")
        print("="*50)
        
        # First try to login as admin and get session
        admin_login_url = f"{self.api_base}/admin/login"
        
        try:
            login_response = requests.post(
                admin_login_url,
                json={
                    "email": "admin@houseofneelam.com",
                    "password": "admin123"
                },
                headers={'Content-Type': 'application/json'}
            )
            
            if login_response.status_code != 200:
                print("❌ Cannot test admin products - admin login failed")
                return False
                
            # Get session cookie from response
            session_cookies = login_response.cookies
            
            # Test create product
            test_product = {
                "name": f"Test Ring {datetime.now().strftime('%H%M%S')}",
                "description": "Beautiful test ring for automated testing",
                "price": 199.99,
                "images": ["https://images.unsplash.com/photo-1763256614634-7feb3ff79ff3"],
                "category": "Rings",
                "stock": 5
            }
            
            success1, created_product = self.run_test(
                "Create Product (Admin)",
                "POST",
                "admin/products",
                200,
                data=test_product,
                cookies=session_cookies
            )
            
            if success1:
                product_id = created_product.get('product_id')
                print(f"   📦 Created product: {product_id}")
                
                # Test update product
                update_data = {
                    "price": 249.99,
                    "stock": 3
                }
                
                success2, updated = self.run_test(
                    "Update Product (Admin)",
                    "PUT",
                    f"admin/products/{product_id}",
                    200,
                    data=update_data,
                    cookies=session_cookies
                )
                
                # Test delete product
                success3, _ = self.run_test(
                    "Delete Product (Admin)",
                    "DELETE",
                    f"admin/products/{product_id}",
                    200,
                    cookies=session_cookies
                )
                
                return success1 and success2 and success3
            
        except Exception as e:
            print(f"❌ Admin product management test failed: {str(e)}")
            
        return False

    def test_orders_flow(self):
        """Test order creation and management"""
        print("\n" + "="*50)
        print("📋 TESTING ORDERS FLOW")
        print("="*50)
        
        # Get a test product first
        try:
            products_response = requests.get(f"{self.api_base}/products")
            if products_response.status_code != 200 or not products_response.json():
                print("❌ Cannot test orders - no products available")
                return False
                
            products = products_response.json()
            test_product = products[0]
            
            # Create test order
            order_data = {
                "items": [{
                    "product_id": test_product['product_id'],
                    "name": test_product['name'],
                    "price": test_product['price'],
                    "quantity": 1,
                    "image": test_product['images'][0]
                }],
                "guest_email": f"test{datetime.now().strftime('%H%M%S')}@example.com",
                "guest_phone": f"555{datetime.now().strftime('%H%M%S')}"
            }
            
            success1, order = self.run_test(
                "Create Order",
                "POST",
                "orders",
                200,
                data=order_data
            )
            
            if success1:
                self.test_order_id = order.get('order_id')
                print(f"   📋 Created order: {self.test_order_id}")
                print(f"   💰 Total: ${order.get('total_amount', 0):.2f}")
                
                # Test get order
                success2, retrieved_order = self.run_test(
                    "Get Order by ID",
                    "GET",
                    f"orders/{self.test_order_id}",
                    200
                )
                
                return success1 and success2
                
        except Exception as e:
            print(f"❌ Orders flow test failed: {str(e)}")
            
        return False

    def test_payment_session_creation(self):
        """Test Stripe payment session creation"""
        print("\n" + "="*50)
        print("💳 TESTING PAYMENT INTEGRATION")
        print("="*50)
        
        if not self.test_order_id:
            print("❌ Cannot test payment - no test order available")
            return False
            
        checkout_data = {
            "order_id": self.test_order_id,
            "origin_url": self.base_url
        }
        
        success, payment_session = self.run_test(
            "Create Payment Session",
            "POST",
            "payment/create-session",
            200,
            data=checkout_data
        )
        
        if success and payment_session.get('url') and payment_session.get('session_id'):
            print(f"   🔗 Payment URL created: {len(payment_session['url'])} chars")
            print(f"   🆔 Session ID: {payment_session['session_id']}")
            
            # Test payment status
            session_id = payment_session['session_id']
            success2, status = self.run_test(
                "Get Payment Status",
                "GET",
                f"payment/status/{session_id}",
                200
            )
            
            if success2:
                print(f"   📊 Payment Status: {status.get('status', 'unknown')}")
            
            return success and success2
            
        return False

    def test_admin_dashboard(self):
        """Test admin dashboard stats"""
        print("\n" + "="*50)
        print("📊 TESTING ADMIN DASHBOARD")
        print("="*50)
        
        # Login as admin first
        try:
            login_response = requests.post(
                f"{self.api_base}/admin/login",
                json={
                    "email": "admin@houseofneelam.com", 
                    "password": "admin123"
                },
                headers={'Content-Type': 'application/json'}
            )
            
            if login_response.status_code != 200:
                print("❌ Cannot test dashboard - admin login failed")
                return False
                
            session_cookies = login_response.cookies
            
            success1, stats = self.run_test(
                "Get Dashboard Stats",
                "GET",
                "admin/dashboard/stats",
                200,
                cookies=session_cookies
            )
            
            if success1:
                print(f"   📊 Total Orders: {stats.get('total_orders', 0)}")
                print(f"   💰 Total Revenue: ${stats.get('total_revenue', 0):.2f}")
                print(f"   ⏳ Pending Orders: {stats.get('pending_orders', 0)}")
                print(f"   📦 Total Products: {stats.get('total_products', 0)}")
                print(f"   ⚠️  Low Stock Items: {stats.get('low_stock_items', 0)}")
            
            success2, all_orders = self.run_test(
                "Get All Orders (Admin)",
                "GET", 
                "admin/orders",
                200,
                cookies=session_cookies
            )
            
            return success1 and success2
            
        except Exception as e:
            print(f"❌ Dashboard test failed: {str(e)}")
            
        return False

    def test_auth_endpoints(self):
        """Test authentication-related endpoints"""
        print("\n" + "="*50)
        print("🔑 TESTING AUTH ENDPOINTS")
        print("="*50)
        
        # Test /auth/me without session (should fail)
        success1, _ = self.run_test(
            "Get Current User (No Auth)",
            "GET",
            "auth/me",
            401
        )
        
        # Test logout
        success2, _ = self.run_test(
            "Logout",
            "POST", 
            "auth/logout",
            200
        )
        
        return success1 and success2

    def run_all_tests(self):
        """Run the complete test suite"""
        print("\n🚀 Starting House of Neelam Backend Test Suite")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test suite
        test_results = {
            "admin_auth": self.test_admin_login(),
            "guest_auth": self.test_guest_auth(), 
            "products_api": self.test_products_api(),
            "admin_products": self.test_admin_products_management(),
            "orders_flow": self.test_orders_flow(),
            "payment_integration": self.test_payment_session_creation(),
            "admin_dashboard": self.test_admin_dashboard(),
            "auth_endpoints": self.test_auth_endpoints(),
        }
        
        # Summary
        print("\n" + "="*60)
        print("📊 TEST RESULTS SUMMARY")
        print("="*60)
        
        for test_name, passed in test_results.items():
            status = "✅ PASSED" if passed else "❌ FAILED"
            print(f"{status} - {test_name.replace('_', ' ').title()}")
        
        passed_count = sum(test_results.values())
        total_count = len(test_results)
        
        print(f"\n🎯 Overall Results:")
        print(f"   API Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"   Feature Tests Passed: {passed_count}/{total_count}")
        print(f"   Success Rate: {(passed_count/total_count)*100:.1f}%")
        
        if passed_count == total_count:
            print("\n🎉 ALL TESTS PASSED! Backend is working correctly.")
            return 0
        else:
            print(f"\n⚠️  {total_count - passed_count} test(s) failed. Check the logs above.")
            return 1

def main():
    """Main test execution"""
    tester = HouseOfNeelamTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())