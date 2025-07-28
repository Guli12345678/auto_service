/*
  Warnings:

  - The `is_creator` column on the `Admin` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "is_creator",
ADD COLUMN     "is_creator" BOOLEAN NOT NULL DEFAULT false;
