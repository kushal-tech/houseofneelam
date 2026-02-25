import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Rings',
    stock: '',
    images: [''],
  });

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        images: product.images,
      });
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin/products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        images: formData.images.filter((url) => url.trim() !== ''),
      };

      if (isEdit) {
        await axios.put(`${API}/admin/products/${id}`, data, {
          withCredentials: true,
        });
        toast.success('Product updated');
      } else {
        await axios.post(`${API}/admin/products`, data, {
          withCredentials: true,
        });
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 text-admin-text hover:text-gold-metallic transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="font-display text-3xl text-admin-text">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-admin-card border border-admin-text-secondary/20 p-8" data-testid="product-form">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
              required
              data-testid="product-name-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
              required
              data-testid="product-description-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">Price (USD) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
                required
                data-testid="product-price-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
                required
                data-testid="product-category-select"
              >
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelets">Bracelets</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">Stock Quantity *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
              required
              data-testid="product-stock-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">Image URLs *</label>
            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <input
                  key={index}
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
                  required={index === 0}
                  data-testid={`product-image-input-${index}`}
                />
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="text-gold-metallic hover:text-gold-matte text-sm font-medium"
              >
                + Add Another Image
              </button>
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-gold-metallic text-white px-8 py-3 font-medium hover:bg-gold-matte transition-all disabled:opacity-50 flex items-center space-x-2"
              data-testid="save-product-btn"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="border border-admin-text-secondary/30 text-admin-text px-8 py-3 font-medium hover:bg-admin-bg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;