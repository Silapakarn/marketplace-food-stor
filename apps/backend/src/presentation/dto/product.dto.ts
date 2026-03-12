export class ProductDto {
  id: number;
  name: string;
  price: number; // Changed to string to include currency formatting
  color?: string; // Optional since we might not always need it in the response
  imageUrl?: string; // Optional product image URL
  hasPairDiscount?: boolean; // Optional for cleaner response
  currency: string
}
