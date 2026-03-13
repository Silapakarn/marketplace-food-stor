const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/api/products`,
  orders: `${API_BASE_URL}/api/orders`,
  redSetAvailability: (productId: number) =>
    `${API_BASE_URL}/api/orders/red-set/${productId}/availability`,
  cancelRedSetReservation: (productId: number) =>
    `${API_BASE_URL}/v1/api/orders/red-set/${productId}/reservation`,
} as const;

export const PRODUCT_COLORS = {
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
  YELLOW: 'yellow',
  PINK: 'pink',
  PURPLE: 'purple',
  ORANGE: 'orange',
} as const;

export const DISCOUNT_RATES = {
  PAIR: 0.05,
  MEMBER: 0.10,
} as const;

export const RED_SET_LOCK_DURATION = 60 * 60 * 1000;

export const CURRENCY_SYMBOL = '฿' as const;
