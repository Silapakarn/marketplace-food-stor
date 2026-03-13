export interface Product {
  id: number;
  name: string;
  color: string;
  price: number;
  imageUrl: string | null;
  currency: string;
  hasPairDiscount: boolean;
}

export interface RedSetAvailability {
  productId: number;
  available: boolean;
  expiresAt?: string;
  message: string;
}