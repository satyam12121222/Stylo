import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { MapPin, Star, ShoppingBag, ArrowRight, Truck, Clock, Shield } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  store: {
    _id: string;
    name: string;
    address: {
      city: string;
    };
  };
  rating: {
    average: number;
    count: number;
  };
}

interface Store {
  _id: string;
  name: string;
  description: string;
  address: {
    city: string;
    state: string;
  };
  rating: {
    average: number;
    count: number;
  };
  images: string[];
}

const Home: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch featured products
  const { data: featuredProducts, isLoading: productsLoading } = useQuery(
    'featuredProducts',
    async () => {
      const response = await axios.get('/api/products/featured');
      return response.data;
    }
  );

  // Fetch nearby stores
  const { data: nearbyStores, isLoading: storesLoading } = useQuery(
    ['nearbyStores', userLocation],
    async () => {
      if (!userLocation) return [];
      const response = await axios.get('/api/stores', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 10
        }
      });
      return response.data;
    },
    { enabled: !!userLocation }
  );

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Fast Delivery',
      description: 'Get your fashion items delivered within 2 hours from nearby stores'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Real-time Updates',
      description: 'Track your order in real-time with live status updates'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Payments',
      description: 'Multiple payment options with secure transaction processing'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Fashion from{' '}
                <span className="text-yellow-300">Nearby Stores</span>
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Discover the latest trends from local boutiques and fashion stores. 
                Shop local, support local businesses, and get your favorite styles 
                delivered to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Shop Now
                </Link>
                <Link to="/stores" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                  Find Stores
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="font-semibold">1000+ Products</h3>
                    <p className="text-sm text-gray-200">From local stores</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="font-semibold">50+ Stores</h3>
                    <p className="text-sm text-gray-200">Nearby locations</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Star className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="font-semibold">4.8 Rating</h3>
                    <p className="text-sm text-gray-200">Customer satisfaction</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="font-semibold">2hr Delivery</h3>
                    <p className="text-sm text-gray-200">Ultra-fast delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Stylo?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We connect you with the best local fashion stores, ensuring quality products 
              and fast delivery right to your doorstep.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="text-primary-600 mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link to="/products" className="flex items-center text-primary-600 hover:text-primary-700">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 4).map((product: Product) => (
                <Link key={product._id} to={`/products/${product._id}`} className="product-card group">
                  <div className="relative mb-4">
                    <img
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-64 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                    />
                    {product.discount && (
                      <span className="absolute top-2 left-2 badge badge-error">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {product.store.name} • {product.store.address.city}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {product.rating.average.toFixed(1)} ({product.rating.count})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="price">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="price-original ml-2">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nearby Stores */}
      {userLocation && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Stores Near You
              </h2>
              <Link to="/stores" className="flex items-center text-primary-600 hover:text-primary-700">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            {storesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyStores?.slice(0, 3).map((store: Store) => (
                  <Link key={store._id} to={`/stores/${store._id}`} className="card p-6 group">
                    <div className="relative mb-4">
                      <img
                        src={store.images[0] || '/placeholder-store.jpg'}
                        alt={store.name}
                        className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {store.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {store.rating.average.toFixed(1)} ({store.rating.count})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{store.address.city}, {store.address.state}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Shop Local?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of customers who are already shopping from nearby stores
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
              Get Started
            </Link>
            <Link to="/stores" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
              Explore Stores
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;



