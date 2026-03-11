/**
 * Order Module - Public API
 * Exports all public interfaces from the order module
 */

// Components
export { OrderSummary } from './components/OrderSummary';

// Hooks
export { useOrder } from './hooks/useOrder';

// Types
export type { 
  OrderItem, 
  CalculationResult, 
  CreateOrderRequest, 
  OrderResponse,
  DiscountDetail 
} from './types/order';

// Services (for advanced use cases)
export { orderApi } from './services/orderApi';
