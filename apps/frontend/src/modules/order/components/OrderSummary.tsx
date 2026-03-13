/**
 * UI Layer - Order Summary Component
 * Displays calculation breakdown with discounts
 */

'use client';

import React from 'react';
import { Card, Space, Divider, Typography, Tag } from 'antd';
import { GiftOutlined, CreditCardOutlined, TrophyOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/shared/utils';
import type { OrderCalculation } from '@/shared/types';

const { Text, Title } = Typography;

interface OrderSummaryProps {
  calculation: OrderCalculation | null;
  memberCardNumber?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ calculation, memberCardNumber }) => {
  if (!calculation) return null;

  const totalSavings = calculation.pairDiscount + calculation.memberDiscount;

  return (
    <Card
      style={{
        borderRadius: '20px',
        border: '1px solid #e0f2f1',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Title level={4} style={{ color: '#115e59', marginBottom: '24px' }}>
        Order Summary
      </Title>

      {/* Total Before Discount */}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: '16px', color: '#6b7280' }}>Subtotal:</Text>
          <Text strong style={{ fontSize: '18px', color: '#374151' }}>
            {formatCurrency(calculation.totalBeforeDiscount)}
          </Text>
        </div>

        {/* Pair Discount */}
        {calculation.pairDiscount > 0 && (
          <>
            <Divider style={{ margin: 0, borderColor: '#e0f2f1' }} />
            <Card
              style={{
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                border: '1px solid #14b8a6',
                borderRadius: '12px',
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <GiftOutlined style={{ fontSize: '20px', color: '#0d9488' }} />
                    <Text strong style={{ color: '#115e59', fontSize: '15px' }}>
                      Pair Discount (5%)
                    </Text>
                  </Space>
                  <Text strong style={{ fontSize: '18px', color: '#0d9488' }}>
                    -{formatCurrency(calculation.pairDiscount)}
                  </Text>
                </div>

                {/* Pair Discount Breakdown */}
                <div style={{ paddingLeft: '28px' }}>
                  {calculation.itemsWithPairDiscount
                    .filter(item => item.discountAmount > 0)
                    .map((item, index) => (
                      <div key={index} style={{ marginTop: '4px' }}>
                        <Text style={{ fontSize: '13px', color: '#047857' }}>
                          • {item.productName}
                          {item.pairBreakdown && (
                            <span style={{ marginLeft: '8px', color: '#065f46' }}>
                              ({item.pairBreakdown.pairs} {item.pairBreakdown.pairs === 1 ? 'pair' : 'pairs'})
                            </span>
                          )}
                        </Text>
                      </div>
                    ))}
                </div>
              </Space>
            </Card>
          </>
        )}

        {/* Member Discount */}
        {calculation.memberDiscount > 0 && (
          <>
            <Divider style={{ margin: 0, borderColor: '#e0f2f1' }} />
            <Card
              style={{
                background: 'linear-gradient(135deg, #f0fdfa, #e0f2f1)',
                border: '1px solid #0d9488',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <CreditCardOutlined style={{ fontSize: '20px', color: '#0d9488' }} />
                  <div>
                    <Text strong style={{ color: '#115e59', fontSize: '15px', display: 'block' }}>
                      Member Card Discount (10%)
                    </Text>
                    {memberCardNumber && (
                      <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                        Card: {memberCardNumber}
                      </Text>
                    )}
                  </div>
                </Space>
                <Text strong style={{ fontSize: '18px', color: '#0d9488' }}>
                  -{formatCurrency(calculation.memberDiscount)}
                </Text>
              </div>
            </Card>
          </>
        )}

        {/* Final Total */}
        <Divider style={{ margin: 0, borderColor: '#e0f2f1' }} />
        <div
          style={{
            background: 'linear-gradient(135deg, #115e59, #0d9488)',
            borderRadius: '16px',
            padding: '20px',
            marginTop: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong style={{ fontSize: '18px', color: 'white' }}>
              Total Amount:
            </Text>
            <Text strong style={{ fontSize: '32px', color: 'white', letterSpacing: '-0.5px' }}>
              {formatCurrency(calculation.finalTotal)}
            </Text>
          </div>
        </div>

        {/* Savings Summary */}
        {totalSavings > 0 && (
          <Card
            style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '1px solid #fbbf24',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <Space>
              <TrophyOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />
              <div>
                <Text strong style={{ fontSize: '16px', color: '#92400e', display: 'block' }}>
                  You saved {formatCurrency(totalSavings)}!
                </Text>
                <Text style={{ fontSize: '13px', color: '#78350f' }}>
                  🎉 Great deal on this order
                </Text>
              </div>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
};
