import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, Package, TrendingUp, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  subcategory: string;
  brand: string;
  isActive: boolean;
  rating: {
    average: number;
    count: number;
  };
  sizes: Array<{
    name: string;
    stock: number;
  }>;
}

interface Store {
  _id: string;
  name: string;
  description: string;
  owner: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  rating: {
    average: number;
    count: number;
  };
  isActive: boolean;
}

const StoreDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch store data
  const { data: stores } = useQuery(
    'userStores',
    async () => {
      const response = await axios.get('/api/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.filter((store: Store) => store.owner === user?.id);
    },
    { enabled: !!token }
  );

  const store = stores?.[0]; // Assuming one store per user for now

  // Fetch products for the store
  const { data: products, isLoading: productsLoading } = useQuery(
    ['storeProducts', store?._id],
    async () => {
      if (!store?._id) return [];
      const response = await axios.get(`/api/products/store/${store._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    { enabled: !!store?._id && !!token }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
    async (productId: string) => {
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['storeProducts']);
        toast.success('Product deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete product');
      }
    }
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the store dashboard.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'store_owner' && user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Owner Access Required</h1>
          <p className="text-gray-600">This page is only available to store owners.</p>
          <button
            onClick={() => window.location.href = '/stores/create'}
            className="mt-4 btn-primary"
          >
            Register Your Store
          </button>
        </div>
      </div>
    );
  }

  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter((p: Product) => p.isActive).length || 0;
  const totalRevenue = products?.reduce((sum: number, p: Product) => sum + (p.price * 10), 0) || 0; // Mock calculation

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user.name}! Manage your store and products.
        </p>
      </div>

      {/* Store Status */}
      {store && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{store.name}</h2>
              <p className="text-gray-600">{store.address.city}, {store.address.state}</p>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-sm text-gray-600">
                    {store.rating.average.toFixed(1)} ({store.rating.count} reviews)
                  </span>
                </div>
                <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${
                  store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button className="btn-outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Store
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <IndianRupee className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Est. Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'products', name: 'Products' },
            { id: 'orders', name: 'Orders' },
            { id: 'analytics', name: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Your Products</h3>
            <button
              onClick={() => window.location.href = '/products/add'}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>

          {productsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first product to your store.</p>
              <button
                onClick={() => window.location.href = '/products/add'}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products?.map((product: Product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.images[0] || '/placeholder-product.jpg'}
                            alt={product.name}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                        <div className="text-sm text-gray-500">{product.subcategory}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₹{product.price}</div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">₹{product.originalPrice}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.sizes.reduce((total, size) => total + size.stock, 0)} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteProductMutation.mutate(product._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => window.location.href = '/products/add'}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <Plus className="h-6 w-6 text-primary-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Add Product</div>
                <div className="text-sm text-gray-500">List a new product in your store</div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <Package className="h-6 w-6 text-primary-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">View Orders</div>
                <div className="text-sm text-gray-500">Manage incoming orders</div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <TrendingUp className="h-6 w-6 text-primary-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Analytics</div>
                <div className="text-sm text-gray-500">View sales and performance</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Orders</h3>
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Orders will appear here once customers start purchasing.</p>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">Store Analytics</h3>
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-600">Detailed analytics and insights will be available here.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDashboard;
