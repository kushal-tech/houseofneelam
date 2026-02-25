import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('checking');
  const [order, setOrder] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      navigate('/');
      return;
    }

    pollPaymentStatus(sessionId);
  }, [searchParams, navigate]);

  const pollPaymentStatus = async (sessionId, currentAttempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (currentAttempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(`${API}/payment/status/${sessionId}`, {
        withCredentials: true,
      });

      if (response.data.payment_status === 'paid') {
        setStatus('success');
        clearCart();
        // Fetch order details
        const orderResponse = await axios.get(
          `${API}/orders?session_id=${sessionId}`,
          { withCredentials: true }
        );
        if (orderResponse.data && orderResponse.data.length > 0) {
          setOrder(orderResponse.data[0]);
        }
        return;
      } else if (response.data.status === 'expired') {
        setStatus('failed');
        return;
      }

      setStatus('processing');
      setTimeout(() => {
        setAttempts(currentAttempts + 1);
        pollPaymentStatus(sessionId, currentAttempts + 1);
      }, pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-alabaster flex items-center justify-center py-24 px-4">
      <div className="max-w-md w-full bg-white p-8 text-center" data-testid="order-success-container">
        {status === 'checking' || status === 'processing' ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold-metallic mx-auto mb-6"></div>
            <h2 className="font-display text-2xl text-sapphire-deep mb-2">Processing Payment</h2>
            <p className="text-neutral-stone">Please wait while we confirm your payment...</p>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h2 className="font-display text-3xl text-sapphire-deep mb-4">Order Confirmed!</h2>
            <p className="text-neutral-stone mb-8">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            {order && (
              <div className="bg-neutral-alabaster p-4 mb-6 text-left">
                <p className="text-sm text-neutral-stone">Order ID</p>
                <p className="font-medium text-sapphire-deep">{order.order_id}</p>
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-gold-metallic text-white py-3 font-medium hover:bg-gold-matte transition-all"
                data-testid="view-orders-btn"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full border-2 border-sapphire-deep text-sapphire-deep py-3 font-medium hover:bg-sapphire-deep hover:text-white transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-red-600 text-5xl mb-6">✕</div>
            <h2 className="font-display text-2xl text-sapphire-deep mb-2">Payment Failed</h2>
            <p className="text-neutral-stone mb-8">
              {status === 'timeout'
                ? 'Payment verification timed out. Please check your email for confirmation.'
                : 'There was an issue processing your payment. Please try again.'}
            </p>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-gold-metallic text-white py-3 font-medium hover:bg-gold-matte transition-all"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;