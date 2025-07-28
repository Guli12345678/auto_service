import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateFirmDto } from "./dto/create-firm.dto";
import { UpdateFirmDto } from "./dto/update-firm.dto";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "../../generated/prisma";

@Injectable()
export class FirmsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createFirmDto: CreateFirmDto) {
    const { regionId, districtId, ownerId } = createFirmDto;
    const region = await this.prismaService.region.findUnique({
      where: { id: regionId },
    });
    const district = await this.prismaService.district.findUnique({
      where: { id: districtId },
    });
    const owner = await this.prismaService.user.findUnique({
      where: { id: ownerId },
    });
    if (!region) {
      throw new NotFoundException("Bunday region topilmadi");
    }
    if (!district) {
      throw new NotFoundException("Bunday district topilmadi");
    }
    if (!owner) {
      throw new NotFoundException("Bunday owner topilmadi");
    }

    if (owner.role !== Role.OWNER) {
      throw new BadRequestException("Userning roli owner bolishi kk");
    }
    const firm = await this.prismaService.firms.create({
      data: {
        name: createFirmDto.name,
        description: createFirmDto.description,
        location: createFirmDto.location,
        regionId: createFirmDto.regionId,
        districtId: createFirmDto.districtId,
        ownerId: createFirmDto.ownerId,
        is_active: createFirmDto.is_active,
        phone_number: createFirmDto.phone_number,
      },
    });
    return firm;
  }

  findAll() {
    return this.prismaService.firms.findMany({
      include: {
        owner: {
          select: {
            full_name: true,
            email: true,
            role: true,
          },
        },
        region: true,
        district: true,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.firms.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            full_name: true,
            email: true,
            role: true,
          },
        },
        region: true,
        district: true,
      },
    });
  }

  update(id: number, updateFirmDto: UpdateFirmDto) {
    return this.prismaService.firms.update({
      data: updateFirmDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prismaService.firms.delete({ where: { id } });
  }
}
