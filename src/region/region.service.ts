import { Injectable } from "@nestjs/common";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RegionService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createRegionDto: CreateRegionDto) {
    return this.prismaService.region.create({
      data: {
        name: createRegionDto.name,
      },
    });
  }

  findAll() {
    return this.prismaService.region.findMany();
  }

  findOne(id: number) {
    return this.prismaService.region.findUnique({ where: { id } });
  }

  update(id: number, updateRegionDto: UpdateRegionDto) {
    return this.prismaService.region.update({
      data: updateRegionDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prismaService.region.delete({ where: { id } });
  }
}
