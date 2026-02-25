import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        withCredentials: true,
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl text-admin-text mb-2">Products</h1>
          <p className="text-admin-text-secondary">Manage your inventory</p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-gold-metallic text-white px-6 py-3 font-medium hover:bg-gold-matte transition-colors flex items-center space-x-2"
          data-testid="add-product-btn"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-admin-card border border-admin-text-secondary/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="products-table">
            <thead className="bg-admin-bg">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-admin-text">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-admin-text">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-admin-text">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-admin-text">Stock</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-admin-text">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-text-secondary/10">
              {products.map((product) => (
                <tr key={product.product_id} className="hover:bg-admin-bg/50" data-testid={`product-row-${product.product_id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover"
                      />
                      <span className="text-admin-text font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-admin-text-secondary">{product.category}</td>
                  <td className="px-6 py-4 text-admin-text">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium ${
                        product.stock < 10 ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/admin/products/${product.product_id}/edit`}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 transition-colors"
                        data-testid={`edit-product-${product.product_id}`}
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.product_id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 transition-colors"
                        data-testid={`delete-product-${product.product_id}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;