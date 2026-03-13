'use client';

import React, { useState } from 'react';
import { Card, Button, Tag, Typography, Image } from 'antd';
import { PlusOutlined, MinusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '@/modules/cart/context/CartContext';
import { formatCurrency, isRedSet } from '@/shared/utils';
import type { Product } from '@/shared/types';

const { Text } = Typography;

interface ProductCardProps {
  product: Product;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyNow }) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const [isHovered, setIsHovered] = useState(false);

  const handleIncrement = () => {
    if (quantity === 0) {
      addItem(product, 1);
    } else {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (quantity === 0) {
      addItem(product, 1);
    }
  };

  // Get icon and gradient based on product color
  const getProductDisplay = (color: string) => {
    const displays: Record<string, { icon: string; gradient: string; iconBg: string }> = {
      red: { 
        icon: '🍅', 
        gradient: 'linear-gradient(to bottom, #fee2e2, #ffffff)',
        iconBg: 'linear-gradient(135deg, #fecaca, #fca5a5)'
      },
      green: { 
        icon: '🥬', 
        gradient: 'linear-gradient(to bottom, #dcfce7, #ffffff)',
        iconBg: 'linear-gradient(135deg, #bbf7d0, #86efac)'
      },
      blue: { 
        icon: '🫐', 
        gradient: 'linear-gradient(to bottom, #dbeafe, #ffffff)',
        iconBg: 'linear-gradient(135deg, #bfdbfe, #93c5fd)'
      },
      yellow: { 
        icon: '🌽', 
        gradient: 'linear-gradient(to bottom, #fef9c3, #ffffff)',
        iconBg: 'linear-gradient(135deg, #fef08a, #fde047)'
      },
      pink: { 
        icon: '🍓', 
        gradient: 'linear-gradient(to bottom, #fce7f3, #ffffff)',
        iconBg: 'linear-gradient(135deg, #fbcfe8, #f9a8d4)'
      },
      purple: { 
        icon: '🍇', 
        gradient: 'linear-gradient(to bottom, #f3e8ff, #ffffff)',
        iconBg: 'linear-gradient(135deg, #e9d5ff, #d8b4fe)'
      },
      orange: { 
        icon: '🥕', 
        gradient: 'linear-gradient(to bottom, #ffedd5, #ffffff)',
        iconBg: 'linear-gradient(135deg, #fed7aa, #fdba74)'
      },
    };
    
    return displays[color.toLowerCase()] || displays.green;
  };

  const display = getProductDisplay(product.color);

  return (
    <Card
      hoverable
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="product-card-hover"
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #e0f2f1',
        background: 'white',
        boxShadow: isHovered 
          ? '0 20px 40px rgba(13, 148, 136, 0.15)' 
          : '0 4px 12px rgba(0, 0, 0, 0.06)',
      }}
      styles={{ body: { padding: '20px' } }}
      cover={
        <div style={{ 
          position: 'relative', 
          background: display.gradient,
          padding: '20px',
          height: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Product Icon with Color Background */}
          <div style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: display.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '100px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.05) rotate(5deg)' : 'scale(1)',
          }}>
            {display.icon}
          </div>

          {/* Badges */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {product.hasPairDiscount && (
              <Tag 
                color="success"
                style={{ 
                  borderRadius: '20px', 
                  padding: '6px 14px',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
                }}
              >
                🎁 5% discount for pair
              </Tag>
            )}
            {isRedSet(product) && (
              <Tag 
                style={{ 
                  borderRadius: '20px', 
                  padding: '6px 14px',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#7c2d12',
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)',
                }}
              >
                ⚡ Limited
              </Tag>
            )}
          </div>

          {quantity > 0 && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#f97316',
              color: 'white',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
            }}>
              {quantity}
            </div>
          )}
        </div>
      }
    >
      {/* Product Name & Category */}
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <Text strong style={{ fontSize: '18px', color: '#115e59', display: 'block', marginBottom: '4px' }}>
          {product.name}
        </Text>
        <Text type="secondary" style={{ fontSize: '13px', color: '#6b7280' }}>
          (Local shop)
        </Text>
      </div>

      {/* Price */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Text strong style={{ 
          fontSize: '32px', 
          color: '#0f172a',
          fontWeight: 700,
          letterSpacing: '-0.5px',
        }}>
          {formatCurrency(product.price).replace('THB', '').trim()}
        </Text>
        <Text type="secondary" style={{ fontSize: '18px', color: '#64748b', marginLeft: '2px' }}>
          $
        </Text>
      </div>

      {/* Quantity Controls or Add Button */}
      {quantity > 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            borderRadius: '16px',
            padding: '8px 16px',
            height: '56px',
          }}
        >
          <Button
            type="text"
            shape="circle"
            size="large"
            icon={<MinusOutlined style={{ fontSize: '18px', color: '#115e59', fontWeight: 'bold' }} />}
            onClick={handleDecrement}
            style={{
              width: '40px',
              height: '40px',
              border: '2px solid #115e59',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="quantity-btn"
          />
          
          <Text strong style={{ fontSize: '24px', color: '#115e59', minWidth: '40px', textAlign: 'center' }}>
            {quantity}
          </Text>
          
          <Button
            type="text"
            shape="circle"
            size="large"
            icon={<PlusOutlined style={{ fontSize: '18px', color: '#115e59', fontWeight: 'bold' }} />}
            onClick={handleIncrement}
            style={{
              width: '40px',
              height: '40px',
              border: '2px solid #115e59',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="quantity-btn"
          />
        </div>
      ) : (
        <Button
          type="text"
          size="large"
          block
          icon={<PlusOutlined style={{ fontSize: '20px', fontWeight: 'bold' }} />}
          onClick={handleAddToCart}
          style={{
            height: '56px',
            borderRadius: '16px',
            background: '#f3f4f6',
            border: 'none',
            color: '#6b7280',
            fontSize: '18px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="quantity-btn"
        />
      )}
    </Card>
  );
};
