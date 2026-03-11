/**
 * Domain Layer - Product Types
 * Core business entities and value objects
 */

export interface Product {
  id: number;
  name: string;
  color: string;
  price: number;
  hasPairDiscount: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
}


export const PRODUCT_COLORS: Record<string, string> = {
  red: '#ff4d4f',
  green: '#52c41a',
  blue: '#1890ff',
  yellow: '#faad14',
  pink: '#eb2f96',
  purple: '#722ed1',
  orange: '#fa8c16',
};
