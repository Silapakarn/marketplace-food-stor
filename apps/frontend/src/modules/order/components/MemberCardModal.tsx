'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, Typography, Space } from 'antd';
import { CreditCardOutlined, GiftOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface MemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardNumber: string) => void;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [cardNumber, setCardNumber] = useState('');

  const handleSubmit = () => {
    onSubmit(cardNumber);
    setCardNumber('');
  };

  const handleSkip = () => {
    onSubmit('');
    setCardNumber('');
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      styles={{
        content: {
          borderRadius: '20px',
          overflow: 'hidden',
        },
      }}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
        }}>
          <GiftOutlined style={{ fontSize: '40px', color: 'white' }} />
        </div>

        {/* Title */}
        <Title level={3} style={{ color: '#115e59', marginBottom: '8px' }}>
          Member Card Discount
        </Title>
        <Text style={{ fontSize: '15px', color: '#6b7280', display: 'block', marginBottom: '32px' }}>
          Get an extra 10% discount on your total!
        </Text>

        {/* Discount Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          border: '2px solid #fbbf24',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '32px',
        }}>
          <Text strong style={{ fontSize: '28px', color: '#f97316', display: 'block' }}>
            10% OFF
          </Text>
          <Text style={{ fontSize: '13px', color: '#78350f' }}>
            Applied to your total amount
          </Text>
        </div>

        {/* Input */}
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input
            size="large"
            placeholder="Enter your member card number"
            prefix={<CreditCardOutlined style={{ color: '#9ca3af', fontSize: '18px' }} />}
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            onPressEnter={handleSubmit}
            style={{
              height: '56px',
              borderRadius: '12px',
              border: '2px solid #e0f2f1',
              fontSize: '16px',
            }}
          />

          {/* Buttons */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              size="large"
              block
              onClick={handleSubmit}
              disabled={!cardNumber.trim()}
              style={{
                height: '56px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              }}
            >
              Apply Discount
            </Button>

            <Button
              size="large"
              block
              onClick={handleSkip}
              style={{
                height: '56px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                background: '#f3f4f6',
                border: 'none',
                color: '#6b7280',
              }}
            >
              Skip & Continue
            </Button>
          </Space>
        </Space>
      </div>
    </Modal>
  );
};
