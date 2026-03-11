/**
 * UI Layer - Main Calculator Page
 * Orchestrates all feature modules (Product, Cart, Order)
 * Following DDD Architecture: UI → Application → Domain → Infrastructure
 */

'use client';

import React from 'react';
import { Layout, Row, Col, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

// Product Module
import { ProductList, useProducts } from '@/modules/product';

// Cart Module
import { MemberCardInput, useCart } from '@/modules/cart';

// Order Module
import { OrderSummary, useOrder } from '@/modules/order';

// Shared Components
import { ActionButtons } from '@/shared/components';

const { Header, Content, Footer } = Layout;

export default function Home() {
  // Product Layer - Fetch and manage products
  const { products, loading } = useProducts();

  // Cart Layer - Manage shopping cart state
  const { 
    items, 
    memberCardNumber, 
    totalItems,
    addItem, 
    removeItem, 
    setMemberCardNumber, 
    clearCart, 
    getQuantity 
  } = useCart();

  // Order Layer - Handle order creation and calculation
  const { calculating, calculation, createOrder, clearCalculation } = useOrder();

  /**
   * Application Logic - Handle Calculate Order
   */
  const handleCalculate = async () => {
    if (items.length === 0) {
      message.warning('Please add items to your cart');
      return;
    }

    const orderData = {
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      memberCardNumber: memberCardNumber || undefined,
    };

    await createOrder(orderData);
  };

  /**
   * Application Logic - Handle Clear Cart
   */
  const handleReset = () => {
    clearCart();
    clearCalculation();
    message.info('Cart cleared');
  };

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold flex items-center">
            <ShoppingCartOutlined className="mr-2" />
            Food Store Calculator
          </h1>
          <div className="text-white text-lg">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </div>
        </div>
      </Header>

      {/* Main Content */}
      <Content className="container mx-auto px-4 py-8">
        <Row gutter={[24, 24]}>
          {/* Products Section - Left Side */}
          <Col xs={24} lg={16}>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Menu</h2>
              <ProductList
                products={products}
                loading={loading}
                getQuantity={getQuantity}
                onAdd={addItem}
                onRemove={removeItem}
              />
            </div>
          </Col>

          {/* Cart & Summary Section - Right Side */}
          <Col xs={24} lg={8}>
            <div className="sticky top-4 space-y-6">
              {/* Member Card Input */}
              <MemberCardInput
                value={memberCardNumber}
                onChange={setMemberCardNumber}
              />

              {/* Action Buttons */}
              <ActionButtons
                onCalculate={handleCalculate}
                onClear={handleReset}
                calculating={calculating}
                disabled={items.length === 0 && !calculation}
              />

              {/* Calculation Summary */}
              {calculation && <OrderSummary calculation={calculation} />}
            </div>
          </Col>
        </Row>
      </Content>

      {/* Footer */}
      <Footer className="text-center bg-gray-800 text-white">
        <p>Food Store Calculator © 2026 | Built with Next.js, NestJS & PostgreSQL</p>
        <p className="text-sm text-gray-400 mt-2">
          Domain-Driven Design Architecture
        </p>
      </Footer>
    </Layout>
  );
}
