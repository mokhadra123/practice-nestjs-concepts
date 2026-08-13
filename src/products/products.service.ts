import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ILike, Repository } from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryProductsDto } from './dto/query-products.dto';
import { Paginated } from 'src/common/types/paginated';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  create(dto: CreateProductDto): Promise<Product> {
    const newProduct = this.productRepository.create(dto);
    return this.productRepository.save(newProduct);
  }

  async findAll(query: QueryProductsDto): Promise<Paginated<Product>> {
    const { page = 1, limit = 20, title } = query;
    const [data, total] = await this.productRepository.findAndCount({
      where: title ? { title: ILike(`%${title}%`) } : {},
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data,
      pagination: {
        total,
        limit,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    this.productRepository.merge(product, dto);

    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: 'Product deleted Successfully' };
  }
}
