'use client';

import React from 'react';
import { Skeleton } from 'antd';
import { ProductCard } from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '@/shared/types';

interface ProductListProps {
  onBuyNow?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onBuyNow }) => {
  const { data: products = [], isPending, isError } = useProducts();

  if (isPending) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white overflow-hidden shadow-sm flex flex-col"
            style={{ borderRadius: 20 }}
          >
            <Skeleton.Image active className="!w-full !h-[170px] !rounded-none" />
            <div className="px-4 py-3">
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '70%' }} />
            </div>
            <div className="h-12 bg-[#ebebE6]" style={{ borderRadius: '0 0 20px 20px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
        <p className="text-red-500 font-medium">Could not load products. Please try again.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-12 text-center">
        <p className="text-gray-400">No products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onBuyNow={onBuyNow} />
      ))}
    </div>
  );
};
