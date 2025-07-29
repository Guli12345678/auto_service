import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCarHistoryDto } from "./dto/create-car_history.dto";
import { UpdateCarHistoryDto } from "./dto/update-car_history.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CarHistoryService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createCarHistoryDto: CreateCarHistoryDto) {
    const owner = await this.prismaService.user.findUnique({
      where: { id: createCarHistoryDto.ownerId },
    });
    if (!owner) {
      throw new NotFoundException("Bunday owner topilmadi");
    }
    const history = await this.prismaService.carHistory.create({
      data: {
        buyed_at: createCarHistoryDto.buyed_at,
        sold_at: createCarHistoryDto.sold_at,
        cars: { connect: { id: createCarHistoryDto.carId } },
        owner: { connect: { id: createCarHistoryDto.ownerId } },
      },
    });
    return history;
  }

  findAll() {
    return this.prismaService.carHistory.findMany({
      include: { owner: true, cars: true },
    });
  }

  findOne(id: number) {
    return this.prismaService.carHistory.findUnique({ where: { id } });
  }

  update(id: number, updateCarHistoryDto: UpdateCarHistoryDto) {
    return this.prismaService.carHistory.update({
      data: updateCarHistoryDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prismaService.carHistory.delete({ where: { id } });
  }
}
