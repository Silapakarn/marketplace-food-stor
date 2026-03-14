export class ProductDto {
  id: number;
  name: string;
  price: number; 
  color?: string;
  imageUrl?: string;
  hasPairDiscount?: boolean;
  currency: string
}
