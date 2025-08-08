import React, { useState } from 'react';
import { CreditCard, Smartphone, Wallet, Banknote, QrCode } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  popular?: boolean;
}

interface PaymentMethodsProps {
  onPaymentMethodSelect: (method: string) => void;
  selectedMethod?: string;
  amount: number;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI',
    icon: <QrCode className="h-6 w-6" />,
    description: 'Pay using Google Pay, PhonePe, Paytm, or any UPI app',
    popular: true
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="h-6 w-6" />,
    description: 'Visa, Mastercard, RuPay, American Express',
    popular: true
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: <Smartphone className="h-6 w-6" />,
    description: 'Pay directly from your bank account'
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: <Wallet className="h-6 w-6" />,
    description: 'Paytm, PhonePe, Amazon Pay, Mobikwik'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: <Banknote className="h-6 w-6" />,
    description: 'Pay when your order is delivered'
  }
];

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  onPaymentMethodSelect,
  selectedMethod,
  amount
}) => {
  const [activeMethod, setActiveMethod] = useState(selectedMethod || '');

  const handleMethodSelect = (methodId: string) => {
    setActiveMethod(methodId);
    onPaymentMethodSelect(methodId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Select Payment Method</h3>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              activeMethod === method.id
                ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  activeMethod === method.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {method.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{method.name}</span>
                    {method.popular && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              </div>
              
              <div className={`w-4 h-4 rounded-full border-2 ${
                activeMethod === method.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
              }`}>
                {activeMethod === method.id && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Security */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-1 bg-white rounded"></div>
          </div>
          <span>Secure payments powered by industry-standard encryption</span>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-xs text-gray-500">Accepted cards:</span>
          <div className="flex space-x-2">
            <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
              VISA
            </div>
            <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
              MC
            </div>
            <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
              RuPay
            </div>
          </div>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total Amount:</span>
          <span className="text-primary-600">₹{amount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
