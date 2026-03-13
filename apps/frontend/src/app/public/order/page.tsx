'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Typography, Button, Card, Space, Divider, Tag, Modal, Empty } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, CheckCircleOutlined, GiftOutlined } from '@ant-design/icons';
import { useCart } from '@/modules/cart/context/CartContext';
import { useCreateOrder } from '@/modules/order/hooks/useCreateOrder';
import { useRedSetAvailability } from '@/modules/product/hooks/useRedSetAvailability';
import { MemberCardModal } from '@/modules/order/components/MemberCardModal';
import { OrderSummary } from '@/modules/order/components/OrderSummary';
import { formatCurrency, isRedSet, getRemainingTime, getProductDisplay } from '@/shared/utils';
import { CreateOrderRequest, OrderResponse } from '@/modules/order/types';
import { CartItem } from '@/modules/cart/types';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function OrderPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { createOrder, orderResponse, loading, error } = useCreateOrder();
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberCardNumber, setMemberCardNumber] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [savedCartItems, setSavedCartItems] = useState<CartItem[]>([]);
  const redSetItem = items.find(item => isRedSet(item.product));
  const redSetId = redSetItem?.product.id || null;
  
  const { availability, loading: checkingAvailability, refetch } = useRedSetAvailability(redSetId);

  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push('/');
    }
  }, [items.length, orderSuccess, router]);

  const handlePlaceOrder = () => {
    if (redSetItem && availability && !availability.available) {
      Modal.warning({
        title: 'Red Set Unavailable',
        content: availability.message,
        okText: 'Got it',
      });
      return;
    }
    
    setShowMemberModal(true);
  };

  const handleMemberCardSubmit = async (cardNumber: string) => {
    setMemberCardNumber(cardNumber);
    setShowMemberModal(false);

    try {
      const orderData: CreateOrderRequest = {
        items: items.map((item: CartItem) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        memberCardNumber: cardNumber || undefined,
      };

      setSavedCartItems(items);
      
      const result = await createOrder(orderData);
      
      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      Modal.error({
        title: 'Order Failed',
        content: `Failed to create order: ${err instanceof Error ? err.message : 'Unknown error'}`,
        okText: 'Try Again',
      });
    }
  };

  if (orderSuccess && orderResponse) {
    return (
      <Layout style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #ffffff 0%, #f0fdfa 100%)' }}>
        <Content style={{ padding: '40px 24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
              }}>
                <CheckCircleOutlined style={{ fontSize: '64px', color: 'white' }} />
              </div>
              <Title level={2} style={{ color: '#115e59', marginBottom: '8px' }}>
                Order Placed Successfully! 🎉
              </Title>
              <Text style={{ fontSize: '16px', color: '#6b7280' }}>
                Order #{orderResponse.id} • {new Date(orderResponse.createdAt).toLocaleString('th-TH')}
              </Text>
            </div>

            <OrderSummary 
              calculation={orderResponse.calculation} 
              memberCardNumber={orderResponse.memberCardNumber || undefined}
            />

            <Card
              style={{
                borderRadius: '20px',
                border: '1px solid #e0f2f1',
                marginTop: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
              }}
            >
              <Title level={4} style={{ color: '#115e59', marginBottom: '20px' }}>
                Order Items
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orderResponse.items.map((item: OrderResponse['items'][0], index: number) => {
                  const originalProduct = savedCartItems.find(cartItem => cartItem.product.name === item.productName)?.product;
                  const display = getProductDisplay(originalProduct?.color || 'orange');
                  
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f0fdfa, #ffffff)',
                        borderRadius: '12px',
                        border: '1px solid #e0f2f1',
                      }}
                    >
                      <Space size="middle">
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          background: display.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        }}>
                          {display.icon}
                        </div>
                        <div>
                          <Text strong style={{ fontSize: '16px', color: '#115e59', display: 'block' }}>
                            {item.productName}
                          </Text>
                          <Text style={{ fontSize: '14px', color: '#9ca3af' }}>
                            {formatCurrency(item.unitPrice)} × {item.quantity}
                          </Text>
                        </div>
                      </Space>
                      <Text strong style={{ fontSize: '18px', color: '#0d9488' }}>
                        {formatCurrency(item.subtotal)}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
              <Button
                size="large"
                block
                onClick={() => router.push('/')}
                style={{
                  height: '56px',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                  border: 'none',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                }}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #ffffff 0%, #f0fdfa 100%)' }}>
      <div style={{
        background: 'linear-gradient(135deg, #115e59 0%, #0d9488 50%, #14b8a6 100%)',
        padding: '24px 32px',
        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ fontSize: '20px', color: 'white' }} />}
            onClick={() => router.push('/')}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <div>
            <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
              Checkout
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px' }}>
              Review your order and complete payment
            </Text>
          </div>
        </div>
      </div>

      <Content style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
         {/* Red Set availability check */}
{redSetItem && (
  <>
    {checkingAvailability ? (
      <Card
        style={{
          borderRadius: '16px',
          border: '2px solid #14b8a6',
          background: 'linear-gradient(135deg, #f0fdfa, #e0f2f1)',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <span style={{ fontSize: '24px' }}>🔍</span>
            <Text strong style={{ fontSize: '16px', color: '#115e59' }}>
              Checking Red Set Availability...
            </Text>
          </Space>
          <Text style={{ color: '#0d9488' }}>
            Please wait while we verify Red Set availability for your order.
          </Text>
        </Space>
      </Card>
    ) : availability && !availability.available ? (
      <Card
        style={{
          borderRadius: '16px',
          border: '2px solid #fbbf24',
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)',
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <Text strong style={{ fontSize: '16px', color: '#92400e' }}>
              Red Set Currently Unavailable
            </Text>
          </Space>

          <Text style={{ color: '#78350f' }}>
            {availability.message}
          </Text>

          {availability.expiresAt && (
            <Text style={{ color: '#78350f', fontSize: '13px' }}>
              Available in:{' '}
              <Text strong style={{ color: '#92400e' }}>
                {getRemainingTime(availability.expiresAt)}
              </Text>
            </Text>
          )}

          <Button
            type="primary"
            size="small"
            onClick={() => refetch()}
            style={{
              background: '#f59e0b',
              border: 'none',
              marginTop: '8px',
            }}
          >
            Check Again
          </Button>
        </Space>
      </Card>
    ) : availability && availability.available ? (
      <Card
        style={{
          borderRadius: '16px',
          border: '2px solid #10b981',
          background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <span style={{ fontSize: '24px' }}>✅</span>
            <Text strong style={{ fontSize: '16px', color: '#065f46' }}>
              Red Set Available
            </Text>
          </Space>

          <Text style={{ color: '#047857' }}>
            Great! Red Set is available and ready for ordering.
          </Text>
        </Space>
      </Card>
    ) : null}
  </>
)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            <div>
              <Card
                style={{
                  borderRadius: '20px',
                  border: '1px solid #e0f2f1',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Title level={4} style={{ margin: 0, color: '#115e59' }}>
                      <ShoppingCartOutlined style={{ marginRight: '8px' }} />
                      Your Items
                    </Title>
                    <Tag style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #14b8a6', fontSize: '14px', padding: '4px 12px' }}>
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </Tag>
                  </Space>

                  <Divider style={{ margin: 0, borderColor: '#e0f2f1' }} />

                  {items.length === 0 ? (
                    <Empty description="No items in cart" />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {items.map((item: CartItem) => {
                        const display = getProductDisplay(item.product.color);
                        
                        return (
                          <div
                            key={item.product.id}
                            style={{
                              display: 'flex',
                              gap: '16px',
                              padding: '16px',
                              background: 'linear-gradient(135deg, #f0fdfa, #ffffff)',
                              borderRadius: '16px',
                              border: '1px solid #e0f2f1',
                            }}
                          >
                            <div style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '16px',
                              background: display.iconBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '52px',
                              flexShrink: 0,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }}>
                              {display.icon}
                            </div>

                            <div style={{ flex: 1 }}>
                              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                  <div>
                                    <Text strong style={{ fontSize: '18px', color: '#115e59', display: 'block' }}>
                                      {item.product.name}
                                    </Text>
                                    <Text style={{ fontSize: '14px', color: '#9ca3af' }}>
                                      {formatCurrency(item.product.price)} × {item.quantity}
                                    </Text>
                                  </div>
                                  <Text strong style={{ fontSize: '20px', color: '#0d9488' }}>
                                    {formatCurrency(item.product.price * item.quantity)}
                                  </Text>
                                </div>
                                
                                <Space size="small">
                                  {item.product.hasPairDiscount && (
                                    <Tag style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: 'white', border: 'none' }}>
                                      🎁 5% Pair Discount
                                    </Tag>
                                  )}
                                  {isRedSet(item.product) && (
                                    <Tag style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#7c2d12', border: 'none' }}>
                                      ⚡ Limited
                                    </Tag>
                                  )}
                                </Space>
                              </Space>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Space>
              </Card>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card
                style={{
                  borderRadius: '20px',
                  border: '2px solid #14b8a6',
                  background: 'linear-gradient(135deg, #f0fdfa, #e0f2f1)',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.15)',
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                  }}>
                    <GiftOutlined style={{ fontSize: '28px', color: 'white' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, color: '#115e59' }}>
                      Have a Member Card?
                    </Title>
                    <Text style={{ fontSize: '13px', color: '#6b7280' }}>
                      Get an extra 10% discount on your total!
                    </Text>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #14b8a6',
                  }}>
                    <Text strong style={{ fontSize: '24px', color: '#f97316' }}>
                      10% OFF
                    </Text>
                  </div>
                </Space>
              </Card>

              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                disabled={items.length === 0 || Boolean(redSetItem && availability && !availability.available)}
                onClick={handlePlaceOrder}
                style={{
                  height: '64px',
                  borderRadius: '16px',
                  fontSize: '18px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                  border: 'none',
                  boxShadow: '0 6px 16px rgba(13, 148, 136, 0.4)',
                }}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>

              {error && (
                <Card style={{ borderRadius: '12px', border: '1px solid #fca5a5', background: '#fef2f2' }}>
                  <Text style={{ color: '#dc2626', fontSize: '14px' }}>
                    {error instanceof Error ? error.message : 'An error occurred'}
                  </Text>
                </Card>
              )}

              <Card
                style={{
                  borderRadius: '16px',
                  border: '1px solid #e0f2f1',
                  background: 'white',
                }}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong style={{ fontSize: '14px', color: '#115e59' }}>
                    Before placing your order:
                  </Text>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '13px' }}>
                    <li>Review your items above</li>
                    <li>Add member card for 10% discount</li>
                    <li>Pair discounts applied automatically</li>
                    {redSetItem && <li style={{ color: '#f97316' }}>⚠️ Red Set availability will be verified</li>}
                  </ul>
                </Space>
              </Card>
            </div>
          </div>
        </div>
      </Content>

      <MemberCardModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSubmit={handleMemberCardSubmit}
      />
    </Layout>
  );
}
