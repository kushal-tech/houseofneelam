import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchWishlist();
    }
  }, [user, authLoading, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/wishlist`, {
        withCredentials: true
      });
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API}/wishlist/remove/${productId}`, {
        withCredentials: true
      });
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success('Added to cart');
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-4xl text-sapphire-deep mb-2">My Wishlist</h1>
          <p className="text-neutral-stone">Save your favorite pieces for later</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-24 bg-neutral-alabaster" data-testid="empty-wishlist">
            <Heart className="h-16 w-16 text-neutral-stone mx-auto mb-4" />
            <p className="text-neutral-stone text-lg mb-6">Your wishlist is empty</p>
            <Link
              to="/products"
              className="inline-block bg-gold-metallic text-white px-8 py-3 font-medium hover:bg-gold-matte transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="wishlist-grid">
            {wishlist.map((item) => (
              <div key={item.product_id} className="group" data-testid={`wishlist-item-${item.product_id}`}>
                <div className="relative aspect-[3/4] bg-neutral-alabaster mb-4 overflow-hidden">
                  <Link to={`/product/${item.product_id}`}>
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
                    data-testid={`remove-wishlist-${item.product_id}`}
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-neutral-stone">
                    {item.category}
                  </p>
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-display text-lg text-sapphire-deep group-hover:text-gold-metallic transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-semibold text-gold-metallic">
                    ${item.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-sapphire-deep text-white py-2 px-4 font-medium hover:bg-sapphire-royal transition-all flex items-center justify-center space-x-2"
                    data-testid={`add-to-cart-${item.product_id}`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;