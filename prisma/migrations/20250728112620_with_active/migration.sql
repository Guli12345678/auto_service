/*
  Warnings:

  - You are about to drop the column `is_activated` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_activated",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
