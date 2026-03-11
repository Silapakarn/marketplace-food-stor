/**
 * Application Layer - Product Hooks
 * Business logic for product operations
 */
 

import { useEffect } from 'react';
import { message } from 'antd';
import { useProductStore } from '../store/productStore';
import { productApi } from '../services/productApi';

export const useProducts = () => {
  const { products, loading, error, setProducts, setLoading, setError } = useProductStore();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load products';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};
