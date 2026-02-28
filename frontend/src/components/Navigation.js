import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartDrawer from './CartDrawer';
import SearchBar from './SearchBar';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gold-pale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center" data-testid="logo-link">
              <h1 className="font-accent text-2xl text-sapphire-deep tracking-wider">House of Neelam</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 flex-1 max-w-2xl mx-8">
              <Link to="/" className="text-sapphire-deep hover:text-gold-metallic transition-colors font-medium whitespace-nowrap" data-testid="nav-home">
                Home
              </Link>
              <Link to="/products" className="text-sapphire-deep hover:text-gold-metallic transition-colors font-medium whitespace-nowrap" data-testid="nav-products">
                Collection
              </Link>
              {user && user.role === 'customer' && (
                <Link to="/orders" className="text-sapphire-deep hover:text-gold-metallic transition-colors font-medium whitespace-nowrap" data-testid="nav-orders">
                  Orders
                </Link>
              )}
              <div className="flex-1">
                <SearchBar />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              {user && user.role === 'customer' && (
                <Link
                  to="/wishlist"
                  className="hidden md:block p-2 text-sapphire-deep hover:text-gold-metallic transition-colors"
                  data-testid="wishlist-button"
                >
                  <Heart className="h-6 w-6" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-sapphire-deep hover:text-gold-metallic transition-colors"
                data-testid="cart-button"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-metallic text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* User */}
              {user ? (
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-sapphire-deep">{user.name}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-sapphire-deep hover:text-gold-metallic transition-colors"
                    data-testid="logout-button"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center space-x-2 text-sapphire-deep hover:text-gold-metallic transition-colors"
                  data-testid="login-link"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">Login</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-sapphire-deep"
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gold-pale" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/"
                className="block text-sapphire-deep hover:text-gold-metallic transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block text-sapphire-deep hover:text-gold-metallic transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Collection
              </Link>
              {user && user.role === 'customer' && (
                <Link
                  to="/orders"
                  className="block text-sapphire-deep hover:text-gold-metallic transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
              {user ? (
                <>
                  <div className="text-sm text-sapphire-deep py-2">{user.name}</div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block text-sapphire-deep hover:text-gold-metallic transition-colors font-medium py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block text-sapphire-deep hover:text-gold-metallic transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navigation;