import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from 'react-query';
import axios from 'axios';
import { Upload, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  sizes: Array<{
    name: string;
    stock: number;
  }>;
  colors: Array<{
    name: string;
    code: string;
  }>;
  specifications: {
    material: string;
    care: string;
    fit: string;
    season: string[];
    occasion: string[];
  };
  tags: string[];
  isFeatured: boolean;
}

const categories = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'bags', label: 'Bags' }
];

const subcategories = {
  men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Ethnic Wear', 'Suits', 'Jackets'],
  women: ['Tops', 'Dresses', 'Sarees', 'Salwar Suits', 'Jeans', 'Skirts', 'Ethnic Wear'],
  kids: ['Boys Clothing', 'Girls Clothing', 'Baby Clothing', 'School Uniforms'],
  accessories: ['Watches', 'Belts', 'Ties', 'Scarves', 'Hats', 'Sunglasses'],
  footwear: ['Casual Shoes', 'Formal Shoes', 'Sports Shoes', 'Sandals', 'Boots'],
  jewelry: ['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Chains'],
  bags: ['Handbags', 'Backpacks', 'Laptop Bags', 'Travel Bags', 'Wallets']
};

const fits = ['slim', 'regular', 'loose', 'oversized'];
// const seasons = ['spring', 'summer', 'fall', 'winter', 'all-season'];
// const occasions = ['casual', 'formal', 'party', 'sports', 'ethnic'];

const AddProduct: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors }
  } = useForm<ProductFormData>({
    defaultValues: {
      sizes: [{ name: 'M', stock: 0 }],
      colors: [{ name: 'Black', code: '#000000' }],
      specifications: {
        material: '',
        care: '',
        fit: 'regular',
        season: [],
        occasion: []
      },
      tags: [],
      isFeatured: false
    }
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control,
    name: 'sizes'
  });

  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control,
    name: 'colors'
  });

  const selectedCategory = watch('category');

  // Create product mutation
  const createProductMutation = useMutation(
    async (productData: ProductFormData) => {
      const response = await axios.post('/api/products', productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Product created successfully!');
        navigate('/dashboard');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create product');
      }
    }
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append('images', file));

    const { data } = await axios.post('/api/products/upload-images', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return data.images as string[];
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsUploading(true);
      
      // Upload images first
      const imageUrls = await uploadImages();
      
      // Calculate discount if original price is provided
      let discount = 0;
      if (data.originalPrice && data.originalPrice > data.price) {
        discount = Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100);
      }

      const productData = {
        ...data,
        images: imageUrls,
        discount,
        tags: typeof data.tags === 'string' ? (data.tags as any).split(',').map((tag: string) => tag.trim()) : data.tags
      };

      await createProductMutation.mutateAsync(productData);
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-2">List a new product in your store</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Product name is required' })}
                className="input-field"
                placeholder="e.g., Cotton Casual Shirt"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                type="text"
                {...register('brand', { required: 'Brand is required' })}
                className="input-field"
                placeholder="e.g., Nike, Adidas, Zara"
              />
              {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="input-field"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory *
              </label>
              <select
                {...register('subcategory', { required: 'Subcategory is required' })}
                className="input-field"
                disabled={!selectedCategory}
              >
                <option value="">Select Subcategory</option>
                {selectedCategory && subcategories[selectedCategory as keyof typeof subcategories]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subcategory && <p className="mt-1 text-sm text-red-600">{errors.subcategory.message}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="input-field"
              placeholder="Describe your product in detail..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                {...register('price', { required: 'Price is required', min: 1 })}
                className="input-field"
                placeholder="999"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₹)
              </label>
              <input
                type="number"
                {...register('originalPrice', { min: 1 })}
                className="input-field"
                placeholder="1299"
              />
              <p className="mt-1 text-xs text-gray-500">Optional - for showing discounts</p>
            </div>

            <div>
              <label className="flex items-center mt-8">
                <input
                  type="checkbox"
                  {...register('isFeatured')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Product</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> product images
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (MAX. 5 images)</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {imagePreview.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreview.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Sizes & Stock</h2>
            <button
              type="button"
              onClick={() => appendSize({ name: '', stock: 0 })}
              className="btn-outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Size
            </button>
          </div>

          <div className="space-y-3">
            {sizeFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    {...register(`sizes.${index}.name` as const, { required: 'Size name is required' })}
                    className="input-field"
                    placeholder="e.g., S, M, L, XL"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    {...register(`sizes.${index}.stock` as const, { required: 'Stock is required', min: 0 })}
                    className="input-field"
                    placeholder="Stock quantity"
                  />
                </div>
                {sizeFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Available Colors</h2>
            <button
              type="button"
              onClick={() => appendColor({ name: '', code: '#000000' })}
              className="btn-outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Color
            </button>
          </div>

          <div className="space-y-3">
            {colorFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    {...register(`colors.${index}.name` as const, { required: 'Color name is required' })}
                    className="input-field"
                    placeholder="e.g., Black, White, Red"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="color"
                    {...register(`colors.${index}.code` as const, { required: 'Color code is required' })}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
                {colorFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Specifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
              <input
                {...register('specifications.material')}
                className="input-field"
                placeholder="e.g., 100% Cotton"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fit</label>
              <select {...register('specifications.fit')} className="input-field">
                {fits.map(fit => (
                  <option key={fit} value={fit}>{fit.charAt(0).toUpperCase() + fit.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
              <input
                {...register('specifications.care')}
                className="input-field"
                placeholder="e.g., Machine wash cold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                {...register('tags')}
                className="input-field"
                placeholder="casual, summer, comfortable (comma separated)"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || createProductMutation.isLoading}
            className="btn-primary"
          >
            {isUploading || createProductMutation.isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Product...
              </div>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
