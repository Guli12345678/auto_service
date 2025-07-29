import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { AdminsModule } from './admins/admins.module';
import { RegionModule } from './region/region.module';
import { DistrictModule } from './district/district.module';
import { FirmsModule } from './firms/firms.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CategoryModule } from './category/category.module';
import { CarModule } from './car/car.module';
import { CarHistoryModule } from './car_history/car_history.module';

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
    ReviewsModule,
    CategoryModule,
    CarModule,
    CarHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
