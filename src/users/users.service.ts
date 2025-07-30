import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import * as bcrypt from "bcrypt";
// import { uuid } from "uuidv4"; // No longer needed as AuthService generates UUID

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, confirm_password, role } = createUserDto;
      if (password !== confirm_password) {
        throw new Error("Passwords do not match");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prismaService.user.create({
        data: {
          full_name: createUserDto.full_name,
          email: createUserDto.email,
          hashed_password: hashedPassword,
          is_active: createUserDto.is_active,
          phone: createUserDto.phone,
          role: createUserDto.role,
          activation_link: createUserDto.activation_link,
        },
      });
      console.log(
        `[USERS SERVICE] User created by Prisma: ${JSON.stringify(user)}`
      );
      return user;
    } catch (error) {
      console.error("[USERS SERVICE] Registration Error:", error);
      throw new BadRequestException(
        "Registration failed. Please check your data and try again."
      );
    }
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  findOne(id: number) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id },
      data: { ...updateUserDto, role: updateUserDto.role },
    });
  }

  remove(id: number) {
    return this.prismaService.user.delete({ where: { id } });
  }
}
