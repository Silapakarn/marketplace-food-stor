'use client';

import React, { useState } from 'react';
import { Card, Button, Tag, Typography } from 'antd';
import { PlusOutlined, MinusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { formatCurrency, getProductDisplay, isRedSet } from '@/shared/utils';
import type { Product } from '../types';

const { Text } = Typography;

interface ProductCardProps {
  product: Product;
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onAddToCart?: () => void;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  quantity = 0,
  onIncrement,
  onDecrement,
  onAddToCart,
  onBuyNow 
}) => {
  const [isHovered, setIsHovered] = useState(false);
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
      <div style={{ marginBottom: '16px' }}>
        <Text strong style={{ fontSize: '18px', color: '#115e59', display: 'block', marginBottom: '8px' }}>
          {product.name}
        </Text>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <Text strong style={{ fontSize: '24px', color: '#0d9488' }}>
            {formatCurrency(product.price)}
          </Text>
          <Text style={{ fontSize: '14px', color: '#9ca3af' }}>
            / piece
          </Text>
        </div>
      </div>

      {quantity === 0 ? (
        <Button
          type="primary"
          size="large"
          block
          icon={<ShoppingCartOutlined />}
          onClick={onAddToCart}
          style={{
            height: '48px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
          }}
        >
          Add to Cart
        </Button>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            borderRadius: '12px',
            padding: '8px 12px',
            height: '48px',
          }}
        >
          <Button
            type="text"
            shape="circle"
            icon={<MinusOutlined style={{ fontSize: '14px', color: '#115e59' }} />}
            onClick={onDecrement}
            style={{
              width: '36px',
              height: '36px',
              border: '2px solid #115e59',
              background: 'white',
            }}
          />
          <Text strong style={{ fontSize: '20px', color: '#115e59' }}>
            {quantity}
          </Text>
          <Button
            type="text"
            shape="circle"
            icon={<PlusOutlined style={{ fontSize: '14px', color: '#115e59' }} />}
            onClick={onIncrement}
            style={{
              width: '36px',
              height: '36px',
              border: '2px solid #115e59',
              background: 'white',
            }}
          />
        </div>
      )}
    </Card>
  );
};
