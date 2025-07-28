import { Injectable } from "@nestjs/common";
import { CreateDistrictDto } from "./dto/create-district.dto";
import { UpdateDistrictDto } from "./dto/update-district.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DistrictService {
  constructor(private readonly prismService: PrismaService) {}
  create(createDistrictDto: CreateDistrictDto) {
    return this.prismService.district.create({
      data: {
        name: createDistrictDto.name,
        region: { connect: { id: createDistrictDto.regionId } },
      },
    });
  }

  findAll() {
    return this.prismService.district.findMany({ include: { region: true } });
  }

  findOne(id: number) {
    return this.prismService.district.findUnique({ where: { id } });
  }

  update(id: number, updateDistrictDto: UpdateDistrictDto) {
    return this.prismService.district.update({
      data: updateDistrictDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prismService.district.delete({ where: { id } });
  }
}
