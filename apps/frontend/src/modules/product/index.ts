/**
 * Product Module - Public API
 * Exports all public interfaces from the product module
 */
 

// Components
export { ProductCard } from './components/ProductCard';
export { ProductList } from './components/ProductList';

// Hooks
export { useProducts } from './hooks/useProducts';

// Store
export { useProductStore } from './store/productStore';

// Types
export type { Product } from './types/product';
export { PRODUCT_COLORS } from './types/product';

// Services (for advanced use cases)
export { productApi } from './services/productApi';
