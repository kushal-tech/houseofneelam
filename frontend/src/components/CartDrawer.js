import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ open, onClose }) => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        data-testid="cart-drawer-backdrop"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
        data-testid="cart-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold-pale">
          <h2 className="font-display text-2xl text-sapphire-deep">Your Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-alabaster rounded transition-colors"
            data-testid="close-cart-button"
          >
            <X className="h-6 w-6 text-sapphire-deep" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-cart">
              <p className="text-neutral-stone text-lg">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product_id} className="flex space-x-4 pb-4 border-b border-neutral-alabaster" data-testid={`cart-item-${item.product_id}`}>
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-20 h-20 object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sapphire-deep">{item.name}</h3>
                    <p className="text-gold-metallic font-semibold mt-1">${item.price.toFixed(2)}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-1 hover:bg-neutral-alabaster rounded transition-colors"
                        data-testid={`decrease-quantity-${item.product_id}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1 bg-neutral-alabaster rounded text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1 hover:bg-neutral-alabaster rounded transition-colors"
                        data-testid={`increase-quantity-${item.product_id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="ml-auto p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                        data-testid={`remove-item-${item.product_id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gold-pale p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-display text-sapphire-deep">Total</span>
              <span className="text-2xl font-display text-gold-metallic" data-testid="cart-total">
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-gold-metallic text-white py-4 font-medium hover:bg-gold-matte transition-colors active:scale-98"
              data-testid="checkout-button"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;