import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CartItem {
  productId: string;
  storeId: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  name: string;
  image: string;
}

const Cart: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: items = [], isLoading } = useQuery<CartItem[]>(
    'cart',
    async () => {
      const res = await axios.get('/api/cart');
      return res.data;
    }
  );

  const updateQty = useMutation<CartItem[], unknown, { productId: string; size: string; color: string; quantity: number }>(
    async ({ productId, size, color, quantity }) => {
      const res = await axios.put(`/api/cart/update/${productId}`, { size, color, quantity });
      return res.data.cart as CartItem[];
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
      onError: () => {
        toast.error('Failed to update quantity');
      }
    }
  );

  const removeItem = useMutation<CartItem[], unknown, { productId: string; size: string; color: string }>(
    async ({ productId, size, color }) => {
      const res = await axios.delete(`/api/cart/remove/${productId}?size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`);
      return res.data.cart as CartItem[];
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Removed from cart');
      },
      onError: () => {
        toast.error('Failed to remove item');
      }
    }
  );

  const clearCart = useMutation<void, unknown, void>(
    async () => {
      await axios.delete('/api/cart/clear');
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Cart cleared');
      },
      onError: () => {
        toast.error('Failed to clear cart');
      }
    }
  );

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 50 : 0;
  const tax = subtotal * 0.18;
  const total = subtotal + deliveryFee + tax;

  const goToCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <img src={item.image || '/placeholder-product.jpg'} alt={item.name} className="w-20 h-20 rounded object-cover" />
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">Size: {item.size} • Color: {item.color}</p>
                  <div className="flex items-center mt-2 space-x-3">
                    <button
                      className="p-1 rounded border"
                      onClick={() => updateQty.mutate({ productId: item.productId, size: item.size, color: item.color, quantity: Math.max(0, item.quantity - 1) })}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      className="p-1 rounded border"
                      onClick={() => updateQty.mutate({ productId: item.productId, size: item.size, color: item.color, quantity: item.quantity + 1 })}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      className="ml-4 p-2 text-red-600 hover:text-red-700"
                      onClick={() => removeItem.mutate({ productId: item.productId, size: item.size, color: item.color })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="text-lg font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
            <button className="btn-outline" onClick={() => clearCart.mutate()}>Clear Cart</button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button className="btn-primary w-full mt-4" onClick={goToCheckout}>Proceed to Checkout</button>
            <p className="text-xs text-gray-500 mt-2">All prices include GST.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;


