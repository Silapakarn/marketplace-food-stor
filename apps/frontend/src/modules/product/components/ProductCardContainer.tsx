'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import { useCart } from '@/modules/cart/context/CartContext';
import type { Product } from '../types';

interface ProductCardContainerProps {
  product: Product;
}

export const ProductCardContainer: React.FC<ProductCardContainerProps> = ({ product }) => {
  const { items, addItem, updateQuantity } = useCart();
  
  const cartItem = items.find(item => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addItem(product);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <ProductCard
      product={product}
      quantity={quantity}
      onAddToCart={handleAddToCart}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
    />
  );
};
