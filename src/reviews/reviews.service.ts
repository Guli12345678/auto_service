import { Injectable } from "@nestjs/common";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createReviewDto: CreateReviewDto) {
    return this.prismaService.reviews.create({
      data: {
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        firms: { connect: { id: createReviewDto.firmId } },
        users: { connect: { id: createReviewDto.userId } },
      },
    });
  }

  findAll() {
    return this.prismaService.reviews.findMany({
      include: {
        firms: true,
        users: {
          select: {
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.reviews.findUnique({ where: { id } });
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return this.prismaService.reviews.update({
      data: updateReviewDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prismaService.reviews.delete({ where: { id } });
  }
}
