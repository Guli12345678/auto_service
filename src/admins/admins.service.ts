import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAdminDto, UpdateAdminDto } from "./dto";
import * as bcrypt from "bcrypt";
@Injectable()
export class AdminsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createAdminDto: CreateAdminDto) {
    const { full_name, email, phone, password, confirm_password, is_creator } =
      createAdminDto;
    if (password !== confirm_password) {
      throw new BadRequestException(
        "Password is not the same as confirm_password"
      );
    }
    const hashed_Password = bcrypt.hashSync(password, 7);

    return this.prismaService.admin.create({
      data: {
        full_name,
        email,
        is_creator,
        phone,
        hashed_password: hashed_Password,
      },
    });
  }

  findAll() {
    return this.prismaService.admin.findMany();
  }

  findOne(id: number) {
    return this.prismaService.admin.findUnique({ where: { id } });
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return this.prismaService.admin.update({
      where: { id },
      data: updateAdminDto,
    });
  }

  remove(id: number) {
    return this.prismaService.admin.delete({ where: { id } });
  }
}
