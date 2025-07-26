import { Controller, Post, Body, Res, Req, Get, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto";
import { SignInUserDto } from "../users/dto/sign-user.dto";
import { CreateAdminDto } from "../admins/dto/create-admin.dto";
import { SignInAdminDto } from "../admins/dto/signin-admin.dto";
import { Request, Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ------------------- USER -------------------

  @Post("user/signup")
  async signUpUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUpUser(createUserDto);
  }

  @Post("user/signin")
  async signIn(@Body() dto: SignInUserDto, @Res() res: Response) {
    return await this.authService.signInUser(dto, res);
  }

  @Post("user/signout")
  async signOutUser(
    @Query("email") email: string,
    @Query("password") password: string
  ) {
    return await this.authService.signOutUser(email, password);
  }

  @Get("user/refresh")
  async refreshUserToken(@Req() req: Request, @Res() res: Response) {
    return await this.authService.refreshUserToken(req, res);
  }

  // ------------------- ADMIN -------------------

  @Post("admin/signup")
  async signUpAdmin(@Body() createAdminDto: CreateAdminDto) {
    return await this.authService.signUpAdmin(createAdminDto);
  }

  @Post("admin/signin")
  async signInAdmin(
    @Body() signInAdminDto: SignInAdminDto,
    @Res() res: Response
  ) {
    return await this.authService.signInAdmin(signInAdminDto, res);
  }

  @Post("admin/signout")
  async signOutAdmin(
    @Query("email") email: string,
    @Query("password") password: string
  ) {
    return await this.authService.signOutAdmin(email, password);
  }

  @Get("admin/refresh")
  async refreshAdminToken(@Req() req: Request, @Res() res: Response) {
    return await this.authService.refreshAdminToken(req, res);
  }
}
