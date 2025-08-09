import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import PaymentMethods from '../components/Payment/PaymentMethods';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | 'cod' | ''>('');
  const [address, setAddress] = useState({
    street: '',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '',
  });

  const { data: items = [] } = useQuery<CartItem[]>(
    'cart',
    async () => {
      const res = await axios.get('/api/cart');
      return res.data;
    }
  );

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 && deliveryType === 'delivery' ? 50 : 0;
  const tax = subtotal * 0.18;
  const total = subtotal + deliveryFee + tax;

  const placeOrder = async () => {
    try {
      if (!items.length) return toast.error('Cart is empty');
      if (!paymentMethod) return toast.error('Select a payment method');
      if (deliveryType === 'delivery' && (!address.street || !address.zipCode)) {
        return toast.error('Please fill delivery address');
      }

      const orderPayload = {
        store: items[0].storeId,
        items: items.map((it) => ({
          product: it.productId,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
        })),
        deliveryAddress: address,
        deliveryType,
        paymentMethod: paymentMethod === 'cod' ? 'cash' : paymentMethod
      };

      const { data: created } = await axios.post('/api/orders', orderPayload);

      // Payment handling
      if (paymentMethod === 'cod') {
        await axios.post('/api/payment/cod', { orderId: created.order._id });
        toast.success('Order placed with Cash on Delivery');
        navigate('/orders');
        return;
      }

      if (paymentMethod === 'upi') {
        const { data } = await axios.post('/api/payment/upi', {
          upiId: 'test@upi',
          amount: total,
          orderId: created.order._id
        });
        if (data.paymentStatus === 'completed') {
          toast.success('UPI payment successful');
          navigate('/orders');
          return;
        }
        return toast.error('UPI payment failed');
      }

      if (paymentMethod === 'wallet') {
        const { data } = await axios.post('/api/payment/wallet', {
          walletType: 'paytm',
          amount: total,
          orderId: created.order._id
        });
        if (data.paymentStatus === 'completed') {
          toast.success('Wallet payment successful');
          navigate('/orders');
          return;
        }
        return toast.error('Wallet payment failed');
      }

      if (paymentMethod === 'card') {
        const { data } = await axios.post('/api/payment/create-payment-intent', { amount: total, currency: 'inr' });
        // In a real app, you'd confirm the payment with Stripe.js on the client
        // For now, mark as completed directly for demo
        await axios.post('/api/payment/confirm', { paymentIntentId: 'demo', orderId: created.order._id });
        toast.success('Card payment processed');
        navigate('/orders');
        return;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Type */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Delivery Options</h2>
              <div className="flex space-x-4">
                <label className={`px-4 py-2 rounded border cursor-pointer ${deliveryType === 'delivery' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                  <input type="radio" name="delivery" className="hidden" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} />
                  Home Delivery
                </label>
                <label className={`px-4 py-2 rounded border cursor-pointer ${deliveryType === 'pickup' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                  <input type="radio" name="delivery" className="hidden" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} />
                  Store Pickup
                </label>
              </div>
            </div>

            {/* Address */}
            {deliveryType === 'delivery' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="input-field" placeholder="Street address" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                  <input className="input-field" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  <input className="input-field" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                  <input className="input-field" placeholder="ZIP Code" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} />
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <PaymentMethods onPaymentMethodSelect={(method) => setPaymentMethod(method as any)} selectedMethod={paymentMethod} amount={total} />
            </div>
          </div>

          {/* Summary */}
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
            <button className="btn-primary w-full mt-4" onClick={placeOrder}>Place Order</button>
            <p className="text-xs text-gray-500 mt-2">All prices include GST.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;


