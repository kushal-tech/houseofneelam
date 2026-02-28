import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  useEffect(() => {
    if (!cartLoading && cart.length === 0) {
      navigate('/products');
    }
  }, [cart, cartLoading, navigate]);

  const handlePaymentSuccess = useCallback(async (response, orderId) => {
    try {
      // Verify payment with backend
      const verifyResponse = await axios.post(
        `${API}/razorpay/verify`,
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        },
        { withCredentials: true }
      );

      if (verifyResponse.data.status === 'success') {
        clearCart();
        toast.success('Payment successful!');
        navigate(`/order-success?order_id=${orderId}`);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    }
  }, [clearCart, navigate]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!user && (!guestEmail || !guestPhone)) {
      toast.error('Please provide your contact details');
      return;
    }

    try {
      setLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

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
      const razorpayResponse = await axios.post(
        `${API}/razorpay/create-order`,
        { order_id: order.order_id },
        { withCredentials: true }
      );

      const { razorpay_order_id, razorpay_key_id, amount, currency } = razorpayResponse.data;

      // Initialize Razorpay checkout
      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: currency,
        name: 'House of Neelam',
        description: 'Jewellery Purchase',
        order_id: razorpay_order_id,
        handler: (response) => handlePaymentSuccess(response, order.order_id),
        prefill: {
          name: user?.name || '',
          email: user?.email || guestEmail,
          contact: guestPhone || '',
        },
        theme: {
          color: '#B8860B',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-neutral-alabaster flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-metallic"></div>
      </div>
    );
  }

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-neutral-alabaster py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-sapphire-deep mb-2">Checkout</h1>
          <p className="text-neutral-stone">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-8 space-y-6" data-testid="order-summary">
            <h2 className="font-display text-2xl text-sapphire-deep mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product_id} className="flex space-x-4 pb-4 border-b">
                  <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sapphire-deep">{item.name}</h3>
                    <p className="text-sm text-neutral-stone">Qty: {item.quantity}</p>
                    <p className="text-gold-metallic font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t-2 border-gold-pale">
              <div className="flex justify-between items-center">
                <span className="text-xl font-display text-sapphire-deep">Total</span>
                <span className="text-2xl font-display text-gold-metallic" data-testid="checkout-total">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Payment Form */}
          <div className="bg-white p-8">
            <h2 className="font-display text-2xl text-sapphire-deep mb-6">Contact Information</h2>
            
            {user ? (
              <div className="space-y-4 mb-8">
                <p className="text-sapphire-deep">
                  <span className="font-medium">Name:</span> {user.name}
                </p>
                <p className="text-sapphire-deep">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              </div>
            ) : (
              <form className="space-y-4 mb-8" data-testid="guest-info-form">
                <div>
                  <label className="block text-sm font-medium text-sapphire-deep mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border-b-2 border-neutral-alabaster focus:border-gold-metallic outline-none bg-transparent"
                    required
                    data-testid="guest-email-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sapphire-deep mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full px-4 py-3 border-b-2 border-neutral-alabaster focus:border-gold-metallic outline-none bg-transparent"
                    required
                    data-testid="guest-phone-input"
                  />
                </div>
              </form>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gold-metallic text-white py-4 font-medium hover:bg-gold-matte transition-all disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-98"
              data-testid="proceed-payment-btn"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span>Proceed to Secure Payment</span>
                </>
              )}
            </button>

            <p className="text-xs text-neutral-stone mt-4 text-center">
              Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;