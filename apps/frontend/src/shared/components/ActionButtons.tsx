/**
 * Shared UI Component - Action Buttons
 * Reusable action buttons for calculate and clear operations
 */

'use client';

import React from 'react';
import { Button, Card } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';

interface ActionButtonsProps {
  onCalculate: () => void;
  onClear: () => void;
  calculating: boolean;
  disabled: boolean;
}


export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCalculate,
  onClear,
  calculating,
  disabled,
}) => {
  return (
    <Card className="shadow-md">
      <Button
        type="primary"
        size="large"
        block
        icon={<CalculatorOutlined />}
        onClick={onCalculate}
        loading={calculating}
        disabled={disabled}
        className="mb-3 bg-blue-500 hover:bg-blue-600 h-12 text-lg font-semibold"
      >
        Calculate Order
      </Button>
      <Button
        size="large"
        block
        onClick={onClear}
        disabled={disabled && !calculating}
        className="h-12"
      >
        Clear Cart
      </Button>
    </Card>
  );
};
