import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Package, Calendar } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/orders`, {
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'shipped':
        return 'text-blue-600 bg-blue-50';
      case 'delivered':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-neutral-stone bg-neutral-alabaster';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-metallic"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-4xl text-sapphire-deep mb-2">My Orders</h1>
          <p className="text-neutral-stone">Track and manage your purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-neutral-alabaster" data-testid="no-orders">
            <Package className="h-16 w-16 text-neutral-stone mx-auto mb-4" />
            <p className="text-neutral-stone text-lg mb-6">You haven't placed any orders yet</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gold-metallic text-white px-8 py-3 font-medium hover:bg-gold-matte transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6" data-testid="orders-list">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="border border-neutral-alabaster p-6 hover:border-gold-metallic transition-colors"
                data-testid={`order-${order.order_id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <p className="text-sm text-neutral-stone">Order ID</p>
                    <p className="font-medium text-sapphire-deep">{order.order_id}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <div className="flex items-center space-x-2 text-sm text-neutral-stone">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium uppercase ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-sapphire-deep">{item.name}</p>
                        <p className="text-sm text-neutral-stone">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-gold-metallic font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-alabaster flex justify-between items-center">
                  <span className="font-display text-sapphire-deep">Total</span>
                  <span className="font-display text-xl text-gold-metallic">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;