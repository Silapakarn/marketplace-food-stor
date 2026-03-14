import { Controller, Get, Param } from '@nestjs/common';
import { ProductResponseService } from '../../application/products/service/product-response.service';
import { ProductDto } from '../dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productResponseService: ProductResponseService,
  ) {}

  @Get()
  async getAllProducts(): Promise<ProductDto[]> {
    return this.productResponseService.getFormattedProducts();
  }

}
