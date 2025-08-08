import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from 'react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Store, Clock, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

interface StoreFormData {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
  };
  categories: string[];
  brands: string[];
  operatingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  deliveryOptions: {
    pickup: boolean;
    delivery: boolean;
    deliveryRadius: number;
    deliveryFee: number;
  };
}

// Available categories for stores
// const categories = [
//   { value: 'men', label: 'Men\'s Fashion' },
//   { value: 'women', label: 'Women\'s Fashion' },
//   { value: 'kids', label: 'Kids Fashion' },
//   { value: 'accessories', label: 'Accessories' },
//   { value: 'footwear', label: 'Footwear' },
//   { value: 'jewelry', label: 'Jewelry' },
//   { value: 'bags', label: 'Bags & Luggage' }
// ];

const StoreRegistration: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<StoreFormData>({
    defaultValues: {
      address: {
        city: 'Pune',
        state: 'Maharashtra',
        coordinates: { lat: 18.5204, lng: 73.8567 } // Default to Pune coordinates
      },
      contact: {
        email: user?.email || ''
      },
      operatingHours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '22:00' },
        sunday: { open: '10:00', close: '20:00' }
      },
      deliveryOptions: {
        pickup: true,
        delivery: true,
        deliveryRadius: 10,
        deliveryFee: 50
      }
    }
  });

  const createStoreMutation = useMutation(
    async (storeData: StoreFormData) => {
      const response = await axios.post('/api/stores', storeData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Store registered successfully! Welcome to Stylo!');
        navigate('/dashboard');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to register store');
      }
    }
  );

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setValue('address.coordinates.lat', latitude);
          setValue('address.coordinates.lng', longitude);
          toast.success('Location updated successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const onSubmit = async (data: StoreFormData) => {
    try {
      // Convert categories and brands from comma-separated strings to arrays
      const formattedData = {
        ...data,
        categories: typeof data.categories === 'string' 
          ? (data.categories as any).split(',').map((cat: string) => cat.trim())
          : data.categories,
        brands: typeof data.brands === 'string'
          ? (data.brands as any).split(',').map((brand: string) => brand.trim())
          : data.brands
      };

      await createStoreMutation.mutateAsync(formattedData);
    } catch (error) {
      console.error('Error registering store:', error);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
        <p className="text-gray-600">You need to be logged in to register a store.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center mb-4">
          <Store className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Register Your Store</h1>
        <p className="text-gray-600 mt-2">
          Join Stylo and start selling your fashion products to customers in Pune
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Store Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Store name is required' })}
                className="input-field"
                placeholder="e.g., Fashion Hub, Trendy Boutique"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className="input-field"
                placeholder="Describe your store, what you sell, and what makes you unique..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories You Sell *
                </label>
                <input
                  {...register('categories', { required: 'At least one category is required' })}
                  className="input-field"
                  placeholder="men, women, accessories (comma separated)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Available: men, women, kids, accessories, footwear, jewelry, bags
                </p>
                {errors.categories && <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popular Brands You Carry
                </label>
                <input
                  {...register('brands')}
                  className="input-field"
                  placeholder="Nike, Adidas, Zara, H&M (comma separated)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Store Address
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                {...register('address.street', { required: 'Street address is required' })}
                className="input-field"
                placeholder="Shop No. 123, ABC Complex, XYZ Road"
              />
              {errors.address?.street && <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  {...register('address.city', { required: 'City is required' })}
                  className="input-field"
                />
                {errors.address?.city && <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  {...register('address.state', { required: 'State is required' })}
                  className="input-field"
                />
                {errors.address?.state && <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  {...register('address.zipCode', { required: 'ZIP code is required' })}
                  className="input-field"
                  placeholder="411001"
                />
                {errors.address?.zipCode && <p className="mt-1 text-sm text-red-600">{errors.address.zipCode.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="btn-outline"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </button>
              {currentLocation && (
                <p className="mt-2 text-sm text-green-600">
                  Location updated: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register('contact.phone', { required: 'Phone number is required' })}
                className="input-field"
                placeholder="9876543210"
              />
              {errors.contact?.phone && <p className="mt-1 text-sm text-red-600">{errors.contact.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                {...register('contact.email', { required: 'Email is required' })}
                className="input-field"
              />
              {errors.contact?.email && <p className="mt-1 text-sm text-red-600">{errors.contact.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Operating Hours
          </h2>
          
          <div className="space-y-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <div key={day} className="grid grid-cols-3 gap-4 items-center">
                <div className="font-medium text-gray-700 capitalize">{day}</div>
                <div>
                  <input
                    type="time"
                    {...register(`operatingHours.${day}.open` as any)}
                    className="input-field"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    {...register(`operatingHours.${day}.close` as any)}
                    className="input-field"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Delivery Options
          </h2>
          
          <div className="space-y-4">
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('deliveryOptions.pickup')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Store Pickup Available</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('deliveryOptions.delivery')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Home Delivery Available</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Radius (km)
                </label>
                <input
                  type="number"
                  {...register('deliveryOptions.deliveryRadius')}
                  className="input-field"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  {...register('deliveryOptions.deliveryFee')}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createStoreMutation.isLoading}
            className="btn-primary"
          >
            {createStoreMutation.isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registering Store...
              </div>
            ) : (
              'Register Store'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreRegistration;
