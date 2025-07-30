import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import { Admin, User } from "../../generated/prisma";
import { AdminsService } from "../admins/admins.service";
import { CreateAdminDto } from "../admins/dto/create-admin.dto";
import { SignInAdminDto } from "../admins/dto/signin-admin.dto";
import { JwtPayload, ResponseFields, Tokens } from "../common/types";
import { AdminResponseFields } from "../common/types/admin-response.type";
import { CreateUserDto, SignInUserDto } from "../users/dto";
import { UsersService } from "../users/users.service";
import { AdminJwtPayload } from "../common/types/admin-jwt-payload.type";
import { randomUUID } from "crypto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly adminsService: AdminsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService
  ) {}

  async generateTokensuser(user: User): Promise<Tokens> {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.SECRET_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signUpUser(createUserDto: CreateUserDto) {
    const condidate = await this.prismaService.user
      .findUnique({ where: { email: createUserDto.email } })
      .catch((err) => {
        console.log("[SIGNUP] getUserByEmail error:", err.message);
        return null;
      });
    if (condidate) {
      throw new ConflictException("user already exists");
    }
    try {
      const activationLink = randomUUID();

      createUserDto.activation_link = activationLink;
      createUserDto.is_active = false;

      const newUser = await this.usersService.create(createUserDto);

      try {
        await this.mailService.sendMail(newUser, activationLink);
      } catch (error) {
        console.log("[SIGNUP] Email error:", error.message);
        throw new ServiceUnavailableException("email da xatolik");
      }
      return {
        message: `Ro'yhatdan o'tdingiz. Akkauntni faollashtirish uchun email ni tasdiqlang!`,
      };
    } catch (error) {
      console.log("[SIGNUP] Registration error:", error.message);
      throw error;
    }
  }
  async activateUser(activationLink: string) {
    if (!activationLink) {
      throw new UnauthorizedException("Activation link is required");
    }
    const user = await this.prismaService.user.findFirst({
      where: { activation_link: activationLink },
    });

    if (!user) {
      throw new NotFoundException("Invalid activation link");
    }

    if (user.is_active) {
      throw new ConflictException("User account is already activated");
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { is_active: true, activation_link: null },
    });

    return { message: "User account activated successfully" };
  }
  async signin(
    signInUserDto: SignInUserDto,
    res: Response
  ): Promise<ResponseFields> {
    const { email, password } = signInUserDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) throw new NotFoundException("User not found");

    const isValid = await bcrypt.compare(password, user.hashed_password);
    if (!isValid)
      throw new UnauthorizedException("Email or password is incorrect");

    const { accessToken, refreshToken } = await this.generateTokensuser(user);
    if (!refreshToken)
      throw new UnauthorizedException("Refresh token generation failed");

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashed_refresh_token: hashedRefreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: +process.env.COOKIE_TIME!,
      httpOnly: true,
    });

    return {
      message: "User signed in 🎉",
      userId: user.id,
      accessToken,
    };
  }

  async signout(userId: number, res: Response) {
    const candidate = await this.prismaService.user.updateMany({
      where: {
        id: userId,
        hashed_refresh_token: {
          not: null,
        },
      },
      data: { hashed_refresh_token: null },
    });

    if (!candidate) {
      throw new ForbiddenException("Access Denied");
    }

    res.clearCookie("refreshToken");
    return true;
  }

  async refreshUserToken(
    userId: number,
    refreshToken: string,
    res: Response
  ): Promise<ResponseFields> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.hashed_refresh_token) {
      throw new UnauthorizedException("Access Denied 1");
    }
    const rtMatches = await bcrypt.compare(
      refreshToken,
      user.hashed_refresh_token
    );

    if (!rtMatches) {
      throw new ForbiddenException("Access Denied 2");
    }

    const tokens: Tokens = await this.generateTokensuser(user);

    const hashed_refresh_token = await bcrypt.hash(tokens.refreshToken, 7);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashed_refresh_token },
    });
    res.cookie("refresh_token", hashed_refresh_token, {
      httpOnly: true,
      secure: true,
    });

    return {
      message: "User accessToken refreshed",
      userId: user.id,
      accessToken: tokens.accessToken,
    };
  }

  async generateTokensAdmin(admin: Admin): Promise<Tokens> {
    const payload: AdminJwtPayload = {
      id: admin.id,
      email: admin.email,
      is_active: admin.is_active,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ADMIN_ACCESS_TOKEN_KEY,
        expiresIn: process.env.ADMIN_ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.ADMIN_REFRESH_TOKEN_KEY,
        expiresIn: process.env.ADMIN_REFRESH_TOKEN_TIME,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signUpAdmin(createAdminDto: CreateAdminDto) {
    const admin = await this.prismaService.admin.findUnique({
      where: { email: createAdminDto.email },
    });
    if (admin) {
      throw new ConflictException("This admin already exists");
    }
    const newAdmin = await this.adminsService.create(createAdminDto);
    return { message: "Admin registered successfully", admin: newAdmin };
  }
  async signinAdmin(
    signInAdminDto: SignInAdminDto,
    res: Response
  ): Promise<AdminResponseFields> {
    const { email, password } = signInAdminDto;

    const admin = await this.prismaService.admin.findUnique({
      where: { email },
    });
    if (!admin) throw new NotFoundException("Admin not found");

    const isValid = await bcrypt.compare(password, admin.hashed_password);
    if (!isValid)
      throw new UnauthorizedException("Email or password is incorrect");

    const { accessToken, refreshToken } = await this.generateTokensAdmin(admin);
    if (!refreshToken)
      throw new UnauthorizedException("Refresh token generation failed");

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.admin.update({
      where: { id: admin.id },
      data: { hashed_refresh_token: hashedRefreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: +process.env.COOKIE_TIME!,
      httpOnly: true,
    });

    return {
      message: "Admin signed in 🎉",
      adminId: admin.id,
      accessToken,
    };
  }

  async signoutAdmin(adminId: number, res: Response) {
    const candidate = await this.prismaService.admin.updateMany({
      where: {
        id: adminId,
        hashed_refresh_token: {
          not: null,
        },
      },
      data: { hashed_refresh_token: null },
    });

    if (!candidate) {
      throw new ForbiddenException("Access Denied");
    }

    res.clearCookie("refreshToken");
    return true;
  }

  async refreshAdminToken(
    adminId: number,
    refreshToken: string,
    res: Response
  ): Promise<AdminResponseFields> {
    const admin = await this.prismaService.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.hashed_refresh_token) {
      throw new UnauthorizedException("Access Denied 1");
    }
    const rtMatches = await bcrypt.compare(
      refreshToken,
      admin.hashed_refresh_token
    );

    if (!rtMatches) {
      throw new ForbiddenException("Access Denied 2");
    }

    const tokens: Tokens = await this.generateTokensAdmin(admin);

    const hashed_refresh_token = await bcrypt.hash(tokens.refreshToken, 7);
    await this.prismaService.admin.update({
      where: { id: admin.id },
      data: { hashed_refresh_token },
    });
    res.cookie("refresh_token", hashed_refresh_token, {
      httpOnly: true,
      secure: true,
    });

    return {
      message: "Admin accessToken refreshed",
      adminId: admin.id,
      accessToken: tokens.accessToken,
    };
  }
}
