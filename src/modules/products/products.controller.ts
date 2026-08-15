import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
  Query,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { CurrentUser } from 'src/common/decorators';
import type { JwtPayload } from 'src/common/types/jwt-payload';
import { Roles } from '../../common/decorators/user-role.decorator';
import { UserType } from 'src/common/types/enums';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserType.ADMIN)
  create(
    @Body(new ValidationPipe()) dto: CreateProductDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.productsService.create(dto, payload.id);
  }

  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserType.ADMIN)
  update(@Param('id') id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }
}
