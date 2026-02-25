import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

      // Create payment session
      const paymentResponse = await axios.post(
        `${API}/payment/create-session`,
        {
          order_id: order.order_id,
          origin_url: window.location.origin,
        },
        { withCredentials: true }
      );

      // Redirect to Stripe
      window.location.href = paymentResponse.data.url;
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