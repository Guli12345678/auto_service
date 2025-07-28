import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { AdminsModule } from './admins/admins.module';
import { RegionModule } from './region/region.module';
import { DistrictModule } from './district/district.module';
import { FirmsModule } from './firms/firms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AdminsModule,
    RegionModule,
    DistrictModule,
    FirmsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
