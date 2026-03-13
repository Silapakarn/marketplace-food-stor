'use client';

import React from 'react';
import { Drawer, Button, Typography, Empty } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useCart } from '@/modules/cart/context/CartContext';
import { formatCurrency } from '@/shared/utils';

const { Title, Text } = Typography;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { items, updateQuantity, removeItem, totalItems } = useCart();

  const cartTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShoppingCartOutlined style={{ fontSize: '24px', color: '#0d9488' }} />
          <Title level={4} style={{ margin: 0, color: '#115e59' }}>
            My Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </Title>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={400}
      styles={{
        header: {
          background: 'linear-gradient(135deg, #f0fdfa, #ffffff)',
          borderBottom: '1px solid #e0f2f1',
        },
        body: {
          padding: 0,
          background: '#fafafa',
        },
      }}
      footer={
        items.length > 0 ? (
          <div style={{ background: 'white', padding: '16px 0' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f0fdfa, #e0f2f1)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal:</Text>
                <Text style={{ fontSize: '16px', color: '#374151' }}>{formatCurrency(cartTotal)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '16px', color: '#115e59' }}>Total:</Text>
                <Text strong style={{ fontSize: '24px', color: '#0d9488' }}>{formatCurrency(cartTotal)}</Text>
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              block
              onClick={onCheckout}
              style={{
                height: '52px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        ) : null
      }
    >
      <div style={{ padding: '16px' }}>
        {items.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#9ca3af', fontSize: '16px' }}>
                  Your cart is empty
                </span>
              }
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div
                key={item.product.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Product Image */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f0fdfa, #e0f2f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    flexShrink: 0,
                  }}>
                    🍽️
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <Text strong style={{ fontSize: '15px', color: '#115e59', display: 'block' }}>
                          {item.product.name}
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {formatCurrency(item.product.price)} each
                        </Text>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeItem(item.product.id)}
                        style={{ color: '#ef4444' }}
                      />
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                          borderRadius: '12px',
                          padding: '6px 12px',
                        }}
                      >
                        <Button
                          type="text"
                          size="small"
                          shape="circle"
                          icon={<MinusOutlined style={{ fontSize: '12px', color: '#115e59' }} />}
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '2px solid #115e59',
                            minWidth: '28px',
                          }}
                        />
                        <Text strong style={{ fontSize: '16px', color: '#115e59', minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </Text>
                        <Button
                          type="text"
                          size="small"
                          shape="circle"
                          icon={<PlusOutlined style={{ fontSize: '12px', color: '#115e59' }} />}
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '2px solid #115e59',
                            minWidth: '28px',
                          }}
                        />
                      </div>
                      <Text strong style={{ fontSize: '16px', color: '#0d9488' }}>
                        {formatCurrency(item.product.price * item.quantity)}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};
