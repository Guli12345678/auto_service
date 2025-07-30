import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto";
import { Request, Response } from "express";
import { SignInUserDto } from "../users/dto/sign-user.dto";
import { ResponseFields } from "../common/types";
import { RefreshTokenGuard } from "../common/guards";
import { GetCurrentUser, GetCurrentUserId } from "../common/decorators";
import { CreateAdminDto } from "../admins/dto";
import { SignInAdminDto } from "../admins/dto/signin-admin.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUpUser(createUserDto);
  }

  @Get("activate/:link")
  async activateUser(@Param("link") link: string, @Res() res: Response) {
    try {
      const result = await this.authService.activateUser(link);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error("Activation Error:", error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.message });
    }
  }

  @Post("signin")
  async signin(@Body() signInUserDto: SignInUserDto, @Res() res: Response) {
    try {
      const result = await this.authService.signin(signInUserDto, res);
      return res.status(200).send(result);
    } catch (error) {
      console.error("Signin Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  async refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseFields> {
    return this.authService.refreshUserToken(+userId, refreshToken, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Post("signout")
  @HttpCode(HttpStatus.OK)
  async signout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signout(userId, res);
  }

  // ========================================================ADMIN===========================================================================================//

  @Post("signup-admin")
  async signUpAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.signUpAdmin(createAdminDto);
  }

  @Post("signin-admin")
  async signinAdmin(
    @Body() signInAdminDto: SignInAdminDto,
    @Res() res: Response
  ) {
    try {
      const result = await this.authService.signinAdmin(signInAdminDto, res);
      return res.status(200).send(result);
    } catch (error) {
      console.error("Signin Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh-admin")
  async refreshTokensAdmin(
    @GetCurrentUserId() adminId: number,
    @GetCurrentUser("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseFields> {
    return this.authService.refreshUserToken(+adminId, refreshToken, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Post("signout-admin")
  @HttpCode(HttpStatus.OK)
  async signoutAdmin(
    @GetCurrentUserId() adminId: number,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signoutAdmin(adminId, res);
  }
}
