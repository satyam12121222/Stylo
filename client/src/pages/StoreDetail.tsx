import React from 'react';
import { useParams } from 'react-router-dom';

const StoreDetail: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold">Store Detail</h1>
      <p className="text-gray-600 mt-2">Store ID: {id}</p>
    </div>
  );
};

export default StoreDetail;


