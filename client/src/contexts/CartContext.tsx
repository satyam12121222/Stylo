import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
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

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'price' | 'name' | 'image'>) => Promise<void>;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
  getCartSummary: () => {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    itemCount: number;
  };
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  const fetchCart = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'price' | 'name' | 'image'>) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/cart/add', item);
      setItems(response.data.cart);
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, size: string, color: string, quantity: number) => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/cart/update/${productId}`, {
        quantity,
        size,
        color
      });
      setItems(response.data.cart);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string, size: string, color: string) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/cart/remove/${productId}?size=${size}&color=${color}`);
      setItems(response.data.cart);
      toast.success('Removed from cart');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await axios.delete('/api/cart/clear');
      setItems([]);
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const getCartSummary = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = items.length > 0 ? 50 : 0;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + deliveryFee + tax;
    const itemCount = items.length;

    return {
      subtotal,
      deliveryFee,
      tax,
      total,
      itemCount
    };
  };

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartSummary,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};



