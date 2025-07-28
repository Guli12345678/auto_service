import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { ConfigModule } from "@nestjs/config";
import { AdminsModule } from "../admins/admins.module";
import {
  AccessTokenStrategy,
  RefreshTokenStrategyCookie,
} from "../common/strategies";

@Module({
  imports: [
    JwtModule.register({}),
    PrismaModule,
    UsersModule,
    AdminsModule,
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategyCookie],
})
export class AuthModule {}
