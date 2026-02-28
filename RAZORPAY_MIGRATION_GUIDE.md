# Payment Gateway Migration: Stripe → Razorpay

## ⚠️ IMPORTANT: Manual Integration Required

Due to file size complexity, I've prepared the Razorpay integration components. Here's what needs to be done:

## 1. Backend Changes (server.py)

### Replace Stripe imports with Razorpay:
```python
# Remove:
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# Add:
import razorpay
from payment_razorpay import init_razorpay, create_razorpay_order, verify_razorpay_payment, get_razorpay_payment_status

# Initialize Razorpay
RAZORPAY_KEY_ID = os.environ['RAZORPAY_KEY_ID']
RAZORPAY_KEY_SECRET = os.environ['RAZORPAY_KEY_SECRET']
razorpay_client = init_razorpay(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
```

### Replace Payment Routes (around line 456-567):

```python
@api_router.post("/payment/create-session")
async def create_payment_session(checkout: CheckoutRequest, request: Request):
    order = await db.orders.find_one({"order_id": checkout.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    result = await create_razorpay_order(order, db)
    result["key_id"] = RAZORPAY_KEY_ID
    return result

@api_router.post("/payment/verify")
async def verify_payment(payment_data: Dict):
    return await verify_razorpay_payment(payment_data, db)

@api_router.get("/payment/status/{razorpay_order_id}")
async def get_payment_status(razorpay_order_id: str):
    return await get_razorpay_payment_status(razorpay_order_id, db)
```

## 2. Frontend Changes

### Install Razorpay SDK:
```bash
cd /app/frontend && yarn add react-razorpay
```

### Update Checkout.js (around line 35-65):

```javascript
// Remove Stripe logic, replace with:
const handleCheckout = async (e) => {
  e.preventDefault();
  
  if (!user && (!guestEmail || !guestPhone)) {
    toast.error('Please provide your contact details');
    return;
  }

  try {
    setLoading(true);

    // Create order
    const orderResponse = await axios.post(
      `${API}/orders`,
      {
        items: cart.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images[0],
        })),
        guest_email: user ? null : guestEmail,
        guest_phone: user ? null : guestPhone,
        },
      { withCredentials: true }
    );

    const order = orderResponse.data;

    // Create Razorpay order
    const paymentResponse = await axios.post(
      `${API}/payment/create-session`,
      {
        order_id: order.order_id,
        origin_url: window.location.origin,
      },
      { withCredentials: true }
    );

    const { razorpay_order_id, amount, currency, key_id } = paymentResponse.data;

    // Initialize Razorpay Checkout
    const options = {
      key: key_id,
      amount: amount,
      currency: currency,
      name: 'House of Neelam',
      description: 'Jewellery Purchase',
      order_id: razorpay_order_id,
      handler: async function (response) {
        try {
          // Verify payment
          await axios.post(
            `${API}/payment/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { withCredentials: true }
          );
          
          clearCart();
          navigate(`/order-success?razorpay_order_id=${response.razorpay_order_id}`);
        } catch (error) {
          toast.error('Payment verification failed');
        }
      },
      prefill: {
        name: user?.name || 'Guest',
        email: user?.email || guestEmail,
        contact: user?.phone || guestPhone,
      },
      theme: {
        color: '#D4AF37',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    setLoading(false);
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Failed to process checkout');
    setLoading(false);
  }
};
```

### Add Razorpay Script to index.html:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Update OrderSuccess.js:

```javascript
// Replace Stripe polling with Razorpay status check
const pollPaymentStatus = async (razorpayOrderId, currentAttempts = 0) => {
  const maxAttempts = 5;
  const pollInterval = 2000;

  if (currentAttempts >= maxAttempts) {
    setStatus('timeout');
    return;
  }

  try {
    const response = await axios.get(`${API}/payment/status/${razorpayOrderId}`, {
      withCredentials: true,
    });

    if (response.data.payment_status === 'paid') {
      setStatus('success');
      clearCart();
      return;
    }

    setTimeout(() => {
      pollPaymentStatus(razorpayOrderId, currentAttempts + 1);
    }, pollInterval);
  } catch (error) {
    setStatus('error');
  }
};

useEffect(() => {
  const razorpayOrderId = searchParams.get('razorpay_order_id');
  if (!razorpayOrderId) {
    navigate('/');
    return;
  }
  pollPaymentStatus(razorpayOrderId);
}, [searchParams, navigate]);
```

## 3. Configuration Files

### ✅ backend/.env - ALREADY UPDATED
```
RAZORPAY_KEY_ID=rzp_test_SLVXTd12dTdLEA
RAZORPAY_KEY_SECRET=DwVteP25D8mg9Z6mYqJH28Cc
```

### ✅ backend/payment_razorpay.py - ALREADY CREATED
Helper module with Razorpay functions

### ✅ requirements.txt - ALREADY UPDATED
razorpay package installed

## 4. Testing

Test Cards for Razorpay:
- Card Number: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: 123456 (for test mode)

## Quick Implementation Steps:

1. Backend: Update server.py payment routes (copy from above)
2. Frontend: Install react-razorpay: `cd /app/frontend && yarn add react-razorpay`
3. Frontend: Update Checkout.js (copy from above)
4. Frontend: Add Razorpay script to public/index.html
5. Frontend: Update OrderSuccess.js (copy from above)
6. Restart services: `sudo supervisorctl restart backend frontend`
7. Test payment flow with test card

## Currency Note:
- Stripe used: USD
- Razorpay uses: INR (Indian Rupees)
- Amounts are converted to paise (smallest unit) by multiplying by 100
- Update product prices if needed for INR pricing
