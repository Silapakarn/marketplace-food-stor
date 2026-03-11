/**
 * UI Layer - Order Summary Component
 * Displays calculation breakdown with discounts
 */

'use client';

import React from 'react';
import { Card, Divider, Tag } from 'antd';
import { CalculationResult } from '../types/order';

interface OrderSummaryProps {
  calculation: CalculationResult | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ calculation }) => {
  if (!calculation) {
    return null;
  }
  

  return (
    <Card className="shadow-lg" title="Order Summary">
      <div className="space-y-3">
        {/* Total Before Discount */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total (before discount):</span>
          <span className="text-xl font-semibold">
            ฿{calculation.totalBeforeDiscount.toFixed(2)}
          </span>
        </div>

        <Divider className="my-3" />

        {/* Pair Discounts */}
        {calculation.itemsWithPairDiscount.length > 0 && (
          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-green-700">
                Pair Discounts (5%):
              </span>
              <span className="text-green-700 font-bold">
                -฿{calculation.pairDiscount.toFixed(2)}
              </span>
            </div>
            {calculation.itemsWithPairDiscount.map((item, index) => (
              <div key={index} className="text-sm text-gray-600 ml-4">
                <div className="flex justify-between">
                  <span>• {item.productName}</span>
                  <span>-฿{item.discountAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Member Card Discount */}
        {calculation.memberDiscount > 0 && (
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-700">
                Member Card Discount (10%):
              </span>
              <span className="text-blue-700 font-bold">
                -฿{calculation.memberDiscount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <Divider className="my-3" />

        {/* Final Total */}
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
          <span className="text-lg font-bold">Final Total:</span>
          <span className="text-2xl font-bold">
            ฿{calculation.finalTotal.toFixed(2)}
          </span>
        </div>

        {/* Savings Summary */}
        {(calculation.pairDiscount > 0 || calculation.memberDiscount > 0) && (
          <div className="text-center mt-3">
            <Tag color="success" className="text-sm">
              You saved ฿
              {(calculation.pairDiscount + calculation.memberDiscount).toFixed(2)}{' '}
              total!
            </Tag>
          </div>
        )}
      </div>
    </Card>
  );
};
