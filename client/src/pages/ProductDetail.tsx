import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold">Product Detail</h1>
      <p className="text-gray-600 mt-2">Product ID: {id}</p>
    </div>
  );
};

export default ProductDetail;


