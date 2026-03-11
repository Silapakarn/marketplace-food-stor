/**
 * UI Layer - Product Card Component
 * Displays individual product with quantity controls
 */

'use client';


import React from 'react';
import { Card, Button, Tag } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Product, PRODUCT_COLORS } from '../types/product';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAdd,
  onRemove,
}) => {
  const bgColor = PRODUCT_COLORS[product.color.toLowerCase()] || '#d9d9d9';

  return (
    <Card
      className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      style={{ borderTop: `4px solid ${bgColor}` }}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
            {product.hasPairDiscount && (
              <Tag color="green" className="text-xs">
                5% Pair Discount
              </Tag>
            )}
          </div>
          <div
            className="w-full h-24 rounded-md mb-3 flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: bgColor }}
          >
            {product.color.toUpperCase()}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ฿{product.price.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <Button
            type="default"
            shape="circle"
            icon={<MinusOutlined />}
            onClick={onRemove}
            disabled={quantity === 0}
            className="hover:bg-red-50"
          />
          <span className="text-xl font-semibold px-4">{quantity}</span>
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={onAdd}
            className="bg-blue-500 hover:bg-blue-600"
          />
        </div>
      </div>
    </Card>
  );
};
