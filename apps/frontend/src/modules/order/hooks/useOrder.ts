/**
 * Application Layer - Order Hooks
 * Business logic for order operations
 */
 

import { useState } from 'react';
import { message } from 'antd';
import { orderApi } from '../services/orderApi';
import { CreateOrderRequest, CalculationResult } from '../types/order';

export const useOrder = () => {
  const [calculating, setCalculating] = useState(false);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);

  const createOrder = async (orderData: CreateOrderRequest): Promise<CalculationResult | null> => {
    try {
      setCalculating(true);
      const response = await orderApi.create(orderData);
      setCalculation(response.calculation);
      message.success('Order calculated successfully!');
      return response.calculation;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to calculate order';
      message.error(errorMessage);
      return null;
    } finally {
      setCalculating(false);
    }
  };

  const clearCalculation = () => {
    setCalculation(null);
  };

  return {
    calculating,
    calculation,
    createOrder,
    clearCalculation,
  };
};
