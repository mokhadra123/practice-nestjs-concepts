import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ProductsService } from 'src/modules/products/products.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { UsersService } from 'src/modules/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryReviewDto } from './dto/query-review.dto';
import { Paginated } from 'src/common/types/paginated';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: number, productId: number, dto: CreateReviewDto) {
    const product = await this.productsService.findOne(productId);
    const user = await this.usersService.findOne(userId);

    const newReview = this.reviewRepository.create({
      ...dto,
      product,
      user,
    });

    const savedReview = await this.reviewRepository.save(newReview);
    return {
      id: savedReview.id,
      rating: savedReview.rating,
      comment: savedReview.comment,
      createdAt: savedReview.createdAt,
      updatedAt: savedReview.updatedAt,
      userId: savedReview.user.id,
      product: savedReview.product.id,
    };
  }

  async findAll(query: QueryReviewDto): Promise<Paginated<Review>> {
    const { page = 1, limit = 20, minRating, maxRating } = query;
    const where: FindOptionsWhere<Review> =
      this.productsService.buildWhere<Review>({
        rating: this.productsService.buildRange(minRating, maxRating),
      });

    const [data, total] = await this.reviewRepository.findAndCount({
      where,
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      pagination: {
        total,
        limit,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException(`Review ${id} not found`);

    return review;
  }

  async update(id: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.findOne(id);
    if (review.user.id !== userId) {
      throw new ForbiddenException('access denied: You not allowed');
    }
    this.reviewRepository.merge(review, dto);

    return this.reviewRepository.save(review);
  }

  async remove(id: number, userId: number) {
    const review = await this.findOne(id);
    if (review.user.id !== userId) {
      throw new ForbiddenException('access denied: You not allowed');
    }

    await this.reviewRepository.remove(review);
    return { message: 'Review deleted Successfully' };
  }
}
