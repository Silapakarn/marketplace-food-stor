'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Typography, Badge, Button, Space, Input } from 'antd';
import { ShoppingCartOutlined, ShopOutlined, SearchOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { ProductList } from '@/modules/product/components/ProductList';
import { CartDrawer } from '@/modules/cart/components/CartDrawer';
import { useCart } from '@/modules/cart/context/CartContext';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function HomePage() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const handleBuyNow = () => {
    router.push('/public/order');
  };

  const handleCheckout = () => {
    setCartDrawerOpen(false);
    router.push('/public/order');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #ffffff 0%, #f0fdfa 100%)' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          background: 'linear-gradient(135deg, #115e59 0%, #0d9488 50%, #14b8a6 100%)',
          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
          height: '80px',
        }}
      >
        {/* Left: Menu + Logo */}
        <Space align="center" size="large">
          <Button 
            type="text" 
            icon={<MenuOutlined style={{ fontSize: '24px', color: 'white' }} />}
            style={{ border: 'none' }}
          />
          <Space align="center" size="middle">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              <ShopOutlined style={{ fontSize: '24px', color: '#0d9488' }} />
            </div>
            <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
              Food Store
            </Title>
          </Space>
        </Space>

        <div style={{ flex: 1, maxWidth: '600px', margin: '0 32px' }}>
          <Input
            size="large"
            placeholder="Search for Grocery, Stores, Vegetable or Meat"
            prefix={<SearchOutlined style={{ color: '#9ca3af', fontSize: '18px' }} />}
            style={{
              borderRadius: '12px',
              border: 'none',
              height: '50px',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        <Space align="center" size="large">
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <Text style={{ color: 'white', fontSize: '14px' }}>
              <Text strong style={{ color: '#fbbf24' }}>Order now</Text> and get it within <Text strong style={{ color: '#fbbf24' }}>15 min!</Text>
            </Text>
          </div>
          
          <Badge count={totalItems} offset={[-5, 5]} overflowCount={99}>
            <Button
              type="text"
              shape="circle"
              size="large"
              icon={<ShoppingCartOutlined style={{ fontSize: '24px', color: '#0d9488' }} />}
              onClick={() => setCartDrawerOpen(true)}
              style={{
                width: '56px',
                height: '56px',
                background: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
          </Badge>

          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <UserOutlined style={{ fontSize: '20px', color: '#0d9488' }} />
          </div>
        </Space>
      </Header>

      <Content style={{ padding: '40px 32px', width: '100%' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          <ProductList onBuyNow={handleBuyNow} />
        </div>
      </Content>

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onCheckout={handleCheckout}
      />
    </Layout>
  );
}
