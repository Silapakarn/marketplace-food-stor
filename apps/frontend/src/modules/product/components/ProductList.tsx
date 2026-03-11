/**
 * UI Layer - Product List Component
 * Displays grid of products
 */
 

'use client';

import React from 'react';
import { Row, Col, Empty, Spin } from 'antd';
import { ProductCard } from './ProductCard';
import { Product } from '../types/product';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  getQuantity: (productId: number) => number;
  onAdd: (product: Product) => void;
  onRemove: (productId: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  getQuantity,
  onAdd,
  onRemove,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (products.length === 0) {
    return <Empty description="No products available" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => (
        <Col xs={24} sm={12} md={8} key={product.id}>
          <ProductCard
            product={product}
            quantity={getQuantity(product.id)}
            onAdd={() => onAdd(product)}
            onRemove={() => onRemove(product.id)}
          />
        </Col>
      ))}
    </Row>
  );
};
