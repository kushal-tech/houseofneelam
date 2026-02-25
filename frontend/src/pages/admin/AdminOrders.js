import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Package } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`, {
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}`,
        { status },
        { withCredentials: true }
      );
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'shipped':
        return 'text-blue-400 bg-blue-500/10';
      case 'delivered':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-admin-text-secondary bg-admin-bg';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-metallic"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-admin-text mb-2">Orders</h1>
        <p className="text-admin-text-secondary">Manage customer orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-admin-card border border-admin-text-secondary/20 p-12 text-center">
          <Package className="h-16 w-16 text-admin-text-secondary mx-auto mb-4" />
          <p className="text-admin-text-secondary">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="orders-list">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-admin-card border border-admin-text-secondary/20 p-6"
              data-testid={`order-${order.order_id}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <p className="text-sm text-admin-text-secondary">Order ID</p>
                  <p className="font-medium text-admin-text">{order.order_id}</p>
                </div>
                <div className="flex items-center space-x-4 mt-2 lg:mt-0">
                  <div className="flex items-center space-x-2 text-sm text-admin-text-secondary">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                    className={`px-3 py-1 text-sm font-medium uppercase bg-admin-bg border border-admin-text-secondary/30 text-admin-text outline-none`}
                    data-testid={`status-select-${order.order_id}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <span className={`px-3 py-1 text-sm font-medium uppercase ${order.payment_status === 'paid' ? 'text-green-400 bg-green-500/10' : 'text-yellow-400 bg-yellow-500/10'}`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex space-x-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-admin-text">{item.name}</p>
                      <p className="text-sm text-admin-text-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gold-metallic font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-admin-text-secondary/10 flex justify-between items-center">
                <div className="text-sm text-admin-text-secondary">
                  {order.guest_phone && <span>Guest: {order.guest_phone}</span>}
                </div>
                <div className="text-right">
                  <span className="text-sm text-admin-text-secondary">Total: </span>
                  <span className="font-display text-xl text-gold-metallic">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;