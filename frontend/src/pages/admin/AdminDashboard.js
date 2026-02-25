import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, DollarSign, Clock, AlertTriangle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard/stats`, {
        withCredentials: true,
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-metallic"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.total_revenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Pending Orders',
      value: stats?.pending_orders || 0,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      title: 'Low Stock Items',
      value: stats?.low_stock_items || 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-admin-text mb-2">Dashboard</h1>
        <p className="text-admin-text-secondary">Overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-admin-card border border-admin-text-secondary/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bg} rounded`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-admin-text-secondary text-sm mb-1">{stat.title}</p>
            <p className="font-display text-3xl text-admin-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-admin-card border border-admin-text-secondary/20 p-6">
        <h2 className="font-display text-xl text-admin-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/orders"
            className="p-4 border border-gold-metallic/30 hover:border-gold-metallic hover:bg-gold-metallic/10 transition-colors"
            data-testid="view-orders-link"
          >
            <h3 className="font-medium text-admin-text mb-1">View Orders</h3>
            <p className="text-sm text-admin-text-secondary">Manage customer orders</p>
          </Link>
          <Link
            to="/admin/products"
            className="p-4 border border-gold-metallic/30 hover:border-gold-metallic hover:bg-gold-metallic/10 transition-colors"
            data-testid="manage-products-link"
          >
            <h3 className="font-medium text-admin-text mb-1">Manage Products</h3>
            <p className="text-sm text-admin-text-secondary">Add or edit inventory</p>
          </Link>
          <Link
            to="/admin/products/new"
            className="p-4 border border-gold-metallic/30 hover:border-gold-metallic hover:bg-gold-metallic/10 transition-colors"
            data-testid="add-product-link"
          >
            <h3 className="font-medium text-admin-text mb-1">Add New Product</h3>
            <p className="text-sm text-admin-text-secondary">Create product listing</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;