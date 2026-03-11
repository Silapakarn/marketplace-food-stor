import { Controller, Get } from '@nestjs/common';
import { GetProductsUseCase } from '../../application/products/get-products.use-case';
import { ProductDto } from '../dto/product.dto';


/**
 * Presentation Layer: Products Controller
 * Handles HTTP requests for product-related operations
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async getAllProducts(): Promise<ProductDto[]> {
    const products = await this.getProductsUseCase.execute();
    
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      color: product.color,
      price: product.getPriceAsNumber(),
      hasPairDiscount: product.hasPairDiscount,
    }));
  }
}
