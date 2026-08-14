import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from 'src/modules/users/decorators/user-role.decorator';
import { UserType } from 'src/common/types/enums';
import { AuthRolesGuard } from 'src/modules/auth/guards/auth-roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/types/jwt-payload';
import { QueryReviewDto } from './dto/query-review.dto';

@Controller('reviews')
@Roles(UserType.ADMIN, UserType.NORMAL_USER)
@UseGuards(AuthRolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':id')
  create(
    @Body() dto: CreateReviewDto,
    @Param('id') id: number,
    @CurrentUser() payload: JwtPayload,
  ) {
    console.log('createDTO', dto);
    console.log('productId', id);
    console.log('payload', payload);
    return this.reviewsService.create(payload.id, +id, dto);
  }

  @Get()
  findAll(@Query() query: QueryReviewDto) {
    return this.reviewsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.reviewsService.update(id, payload.id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @CurrentUser() payload: JwtPayload) {
    return this.reviewsService.remove(id, payload.id);
  }
}
