import { CURRENCY_SYMBOL } from '../constants';
import type { Product } from '../types';

export const formatCurrency = (amount: number, currency: string = CURRENCY_SYMBOL): string => {
  const hasDecimals = amount % 1 !== 0;
  return `${currency}${hasDecimals ? amount.toFixed(2) : amount}`;
};

export const getProductColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-400',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };
  return colorMap[color.toLowerCase()] || 'bg-gray-500';
};

export const getProductColorBorder = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: 'border-red-400',
    green: 'border-green-400',
    blue: 'border-blue-400',
    yellow: 'border-yellow-400',
    pink: 'border-pink-400',
    purple: 'border-purple-400',
    orange: 'border-orange-400',
  };
  return colorMap[color.toLowerCase()] || 'border-gray-300';
};

export const isRedSet = (product: Product | { color: string }): boolean =>
  product.color.toLowerCase() === 'red';

export const formatDateTime = (date: string | Date): string =>
  new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

export const getRemainingTime = (expiresAt: string): string => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const minutes = Math.ceil(diff / 60000);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};

export const getProductDisplay = (color: string): { icon: string; gradient: string; iconBg: string } => {
  const displays: Record<string, { icon: string; gradient: string; iconBg: string }> = {
    red: { 
      icon: '🍅', 
      gradient: 'linear-gradient(to bottom, #fee2e2, #ffffff)',
      iconBg: 'linear-gradient(135deg, #fecaca, #fca5a5)'
    },
    green: { 
      icon: '🥬', 
      gradient: 'linear-gradient(to bottom, #dcfce7, #ffffff)',
      iconBg: 'linear-gradient(135deg, #bbf7d0, #86efac)'
    },
    blue: { 
      icon: '🫐', 
      gradient: 'linear-gradient(to bottom, #dbeafe, #ffffff)',
      iconBg: 'linear-gradient(135deg, #bfdbfe, #93c5fd)'
    },
    yellow: { 
      icon: '🌽', 
      gradient: 'linear-gradient(to bottom, #fef9c3, #ffffff)',
      iconBg: 'linear-gradient(135deg, #fef08a, #fde047)'
    },
    pink: { 
      icon: '🍓', 
      gradient: 'linear-gradient(to bottom, #fce7f3, #ffffff)',
      iconBg: 'linear-gradient(135deg, #fbcfe8, #f9a8d4)'
    },
    purple: { 
      icon: '🍇', 
      gradient: 'linear-gradient(to bottom, #f3e8ff, #ffffff)',
      iconBg: 'linear-gradient(135deg, #e9d5ff, #d8b4fe)'
    },
    orange: { 
      icon: '🥕', 
      gradient: 'linear-gradient(to bottom, #ffedd5, #ffffff)',
      iconBg: 'linear-gradient(135deg, #fed7aa, #fdba74)'
    },
  };
  
  return displays[color.toLowerCase()] || displays.green;
};
