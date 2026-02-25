import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }
    addToCart(product, quantity);
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-metallic"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4" data-testid="product-images">
            <div className="aspect-[3/4] bg-neutral-alabaster">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex space-x-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 border-2 ${
                      selectedImage === index ? 'border-gold-metallic' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6" data-testid="product-details">
            <p className="text-xs uppercase tracking-widest text-gold-metallic font-medium">
              {product.category}
            </p>
            <h1 className="font-display text-4xl lg:text-5xl text-sapphire-deep">{product.name}</h1>
            <p className="text-3xl font-display text-gold-metallic">${product.price.toFixed(2)}</p>

            <p className="text-neutral-stone leading-relaxed text-lg">{product.description}</p>

            <div className="flex items-center space-x-2 text-sm">
              <Package className="h-5 w-5 text-neutral-stone" />
              <span className="text-neutral-stone">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-sapphire-deep">Quantity</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-neutral-alabaster hover:bg-gold-pale transition-colors"
                  data-testid="decrease-quantity"
                >
                  -
                </button>
                <span className="px-6 py-2 bg-neutral-alabaster font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 bg-neutral-alabaster hover:bg-gold-pale transition-colors"
                  data-testid="increase-quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-gold-metallic text-white py-4 font-medium flex items-center justify-center space-x-2 hover:bg-gold-matte transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              data-testid="add-to-cart-btn"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;