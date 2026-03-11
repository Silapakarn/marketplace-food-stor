/**
 * UI Layer - Member Card Input Component
 */
 

'use client';

import React from 'react';
import { Card, Input } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

interface MemberCardInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const MemberCardInput: React.FC<MemberCardInputProps> = ({ value, onChange }) => {
  return (
    <Card className="shadow-md">
      <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
        <CreditCardOutlined className="mr-2" />
        Member Card
      </h3>
      <Input
        placeholder="Enter member card number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        prefix={<CreditCardOutlined />}
        size="large"
        className="mb-2"
      />
      <p className="text-sm text-gray-500">
        Enter your member card to get 10% discount
      </p>
    </Card>
  );
};
