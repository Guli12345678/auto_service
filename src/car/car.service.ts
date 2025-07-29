import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCarDto } from "./dto/create-car.dto";
import { UpdateCarDto } from "./dto/update-car.dto";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "../../generated/prisma";

@Injectable()
export class CarService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createCarDto: CreateCarDto) {
    const owner = await this.prismaService.user.findUnique({
      where: { id: createCarDto.current_ownerId },
    });
    if (!owner) {
      throw new NotFoundException("Bunday owner topilmadi");
    }
    if (owner.role != Role.OWNER) {
      throw new BadRequestException("User's role must be owner");
    }
    if (owner.is_active != true) {
      throw new BadRequestException("User aktiv emas");
    }
    const car = await this.prismaService.car.create({
      data: {
        plate_number: createCarDto.plate_number,
        vin_number: createCarDto.vin_number,
        model: createCarDto.model,
        year: createCarDto.year,
        owner: { connect: { id: createCarDto.current_ownerId } },
      },
    });
    return car;
  }

  findAll() {
    return this.prismaService.car.findMany({
      include: { carHistory: true, owner: true },
    });
  }

  findOne(id: number) {
    return this.prismaService.car.findMany({
      include: { carHistory: true, owner: true },
    });
  }

  update(id: number, updateCarDto: UpdateCarDto) {
    return this.prismaService.car.update({ data: updateCarDto, where: { id } });
  }

  remove(id: number) {
    return this.prismaService.car.delete({ where: { id } });
  }
}
