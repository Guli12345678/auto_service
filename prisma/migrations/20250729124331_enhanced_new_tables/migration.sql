/*
  Warnings:

  - You are about to drop the `Car` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CarHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_current_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CarHistory" DROP CONSTRAINT "CarHistory_carId_fkey";

-- DropForeignKey
ALTER TABLE "CarHistory" DROP CONSTRAINT "CarHistory_ownerId_fkey";

-- DropTable
DROP TABLE "Car";

-- DropTable
DROP TABLE "CarHistory";

-- CreateTable
CREATE TABLE "car" (
    "id" SERIAL NOT NULL,
    "plate_number" TEXT NOT NULL,
    "vin_number" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "current_ownerId" INTEGER NOT NULL,

    CONSTRAINT "car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_history" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "buyed_at" TIMESTAMP(3) NOT NULL,
    "sold_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "car" ADD CONSTRAINT "car_current_ownerId_fkey" FOREIGN KEY ("current_ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_history" ADD CONSTRAINT "car_history_carId_fkey" FOREIGN KEY ("carId") REFERENCES "car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_history" ADD CONSTRAINT "car_history_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
