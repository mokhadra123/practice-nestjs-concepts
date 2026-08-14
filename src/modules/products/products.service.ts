import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Between,
  FindOperator,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryProductsDto } from './dto/query-products.dto';
import { Paginated } from 'src/common/types/paginated';
import { UsersService } from 'src/modules/users/users.service';
import {
  DEFAULT_LIMIT_NUMBER,
  DEFAULT_PAGE_NUMBER,
} from 'src/common/constants';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateProductDto, userId: number): Promise<Product> {
    const user = await this.usersService.findOne(userId);
    const newProduct = this.productRepository.create({
      ...dto,
      title: dto.title.toLocaleLowerCase(),
      user,
    });
    return this.productRepository.save(newProduct);
  }

  async findAll(query: QueryProductsDto): Promise<Paginated<Product>> {
    const {
      page = DEFAULT_PAGE_NUMBER,
      limit = DEFAULT_LIMIT_NUMBER,
      title,
      minPrice,
      maxPrice,
    } = query;

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException(
        'min price cannot be greater thant max price',
      );
    }

    const where: FindOptionsWhere<Product> = this.buildWhere<Product>({
      title: title ? ILike(`%${title}%`) : undefined,
      price: this.buildRange(minPrice, maxPrice),
    });

    const [data, total] = await this.productRepository.findAndCount({
      where,
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

  buildWhere<T>(filters: Partial<FindOptionsWhere<T>>) {
    return Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    );
  }

  buildRange<T>(min?: T, max?: T): FindOperator<T> | undefined {
    if (min !== undefined && max !== undefined) return Between(min, max);
    if (min !== undefined) return MoreThanOrEqual(min);
    if (max !== undefined) return LessThanOrEqual(max);
    return undefined;
  }
}
