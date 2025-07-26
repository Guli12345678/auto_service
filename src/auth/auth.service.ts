import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "../users/dto";
import { UsersService } from "../users/users.service";
import { SignInUserDto } from "../users/dto/sign-user.dto";
import { Request, Response } from "express";
import { Admin, User } from "../../generated/prisma";
import { AdminsService } from "../admins/admins.service";
import { CreateAdminDto } from "../admins/dto/create-admin.dto";
import { SignInAdminDto } from "../admins/dto/signin-admin.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly adminService: AdminsService
  ) {}

  async signUpUser(createUserDto: CreateUserDto) {
    const existing = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException("This user already exists");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;

    const newUser = await this.usersService.create(createUserDto);
    return { message: "User registered successfully", user: newUser };
  }

  async signInUser(signInUserDto: SignInUserDto, res: Response) {
    const { email, password } = signInUserDto;

    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException("User not found");

    const isValid = await bcrypt.compare(password, user.hashed_password);
    if (!isValid)
      throw new UnauthorizedException("Email or password is incorrect");

    const payload = { id: user.id, email: user.email };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: process.env.SECRET_TOKEN_TIME,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: process.env.REFRESH_TOKEN_TIME,
    });

    if (!refresh_token) {
      throw new UnauthorizedException("Refresh token generation failed");
    }

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashed_refresh_token: hashedRefreshToken },
    });

    res.cookie("refresh_token", refresh_token, {
      maxAge: +process.env.COOKIE_TIME!,
      httpOnly: true,
    });

    return res.json({
      message: "User signed in 🎉",
      userId: user.id,
      access_token,
    });
  }

  async signOutUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException("User not found");

    const isValid = await bcrypt.compare(password, user.hashed_password);
    if (!isValid) throw new UnauthorizedException("Invalid password");

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashed_refresh_token: null },
    });

    return { message: "User signed out successfully 🍉" };
  }

  async refreshUserToken(req: Request, res: Response) {
    const refresh_token = req.cookies?.refresh_token;
    if (!refresh_token)
      throw new BadRequestException("Refresh token is required");

    let decoded: any;
    try {
      decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY!);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = await this.usersService.findOne(decoded.id);
    if (!user || !user.hashed_refresh_token) {
      throw new UnauthorizedException("User not found or token missing");
    }

    const isMatch = await bcrypt.compare(
      refresh_token,
      user.hashed_refresh_token
    );
    if (!isMatch) {
      throw new UnauthorizedException("Token mismatch");
    }

    const payload = { id: user.id };
    const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY!, {
      expiresIn: process.env.SECRET_TOKEN_TIME!,
    });

    const new_refresh_token = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_KEY!,
      {
        expiresIn: process.env.REFRESH_TOKEN_TIME!,
      }
    );

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashed_refresh_token: await bcrypt.hash(new_refresh_token, 7) },
    });

    res.cookie("refresh_token", new_refresh_token, {
      httpOnly: true,
      secure: true,
    });

    return {
      message: "User accessToken refreshed",
      access_token,
    };
  }

  async signUpAdmin(createAdminDto: CreateAdminDto) {
    const admin = await this.prismaService.admin.findUnique({
      where: { email: createAdminDto.email },
    });
    if (admin) {
      throw new ConflictException("This admin already exists");
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    createAdminDto.password = hashedPassword;

    const newAdmin = await this.adminService.create(createAdminDto);
    return { message: "Admin registered successfully", admin: newAdmin };
  }

  async signInAdmin(signInAdminDto: SignInAdminDto, res: Response) {
    const { email, password } = signInAdminDto;

    const admin = await this.prismaService.admin.findUnique({
      where: { email },
    });
    if (!admin) throw new NotFoundException("Admin not found");

    const isValid = await bcrypt.compare(password, admin.hashed_password);
    if (!isValid)
      throw new UnauthorizedException("Email or password is incorrect");

    const payload = { id: admin.id, email: admin.email };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.ADMIN_ACCESS_TOKEN_KEY,
      expiresIn: process.env.ADMIN_ACCESS_TOKEN_TIME,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.ADMIN_REFRESH_TOKEN_KEY,
      expiresIn: process.env.ADMIN_REFRESH_TOKEN_TIME,
    });

    if (!refresh_token) {
      throw new UnauthorizedException("Refresh token generation failed");
    }

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.prismaService.admin.update({
      where: { id: admin.id },
      data: { hashed_refresh_token: hashedRefreshToken },
    });

    res.cookie("refresh_token", refresh_token, {
      maxAge: +process.env.COOKIE_TIME!,
      httpOnly: true,
    });

    return res.json({
      message: "Admin signed in 🎉",
      adminId: admin.id,
      access_token,
    });
  }

  async signOutAdmin(email: string, password: string) {
    const admin = await this.prismaService.admin.findUnique({
      where: { email },
    });
    if (!admin) throw new NotFoundException("Admin not found");

    const isValid = await bcrypt.compare(password, admin.hashed_password);
    if (!isValid) throw new UnauthorizedException("Invalid password");

    await this.prismaService.admin.update({
      where: { id: admin.id },
      data: { hashed_refresh_token: null },
    });

    return { message: "Admin signed out successfully 🍉" };
  }

  async refreshAdminToken(req: Request, res: Response) {
    const refresh_token = req.cookies?.refresh_token;
    if (!refresh_token)
      throw new BadRequestException("Refresh token is required");

    let decoded: any;
    try {
      decoded = jwt.verify(refresh_token, process.env.ADMIN_REFRESH_TOKEN_KEY!);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const admin = await this.adminService.findOne(decoded.id);
    if (!admin || !admin.hashed_refresh_token) {
      throw new UnauthorizedException("Admin not found or token missing");
    }

    const isMatch = await bcrypt.compare(
      refresh_token,
      admin.hashed_refresh_token!
    );
    if (!isMatch) {
      throw new UnauthorizedException("Token mismatch");
    }

    const payload = { id: admin.id };
    const access_token = jwt.sign(
      payload,
      process.env.ADMIN_ACCESS_TOKEN_KEY!,
      {
        expiresIn: process.env.ADMIN_ACCESS_TOKEN_TIME!,
      }
    );

    const new_refresh_token = jwt.sign(
      payload,
      process.env.ADMIN_REFRESH_TOKEN_KEY!,
      {
        expiresIn: process.env.ADMIN_REFRESH_TOKEN_TIME!,
      }
    );

    await this.prismaService.admin.update({
      where: { id: admin.id },
      data: { hashed_refresh_token: await bcrypt.hash(new_refresh_token, 7) },
    });

    res.cookie("refresh_token", new_refresh_token, {
      httpOnly: true,
      secure: true,
    });

    return {
      message: "Admin accessToken refreshed",
      access_token,
    };
  }
}
