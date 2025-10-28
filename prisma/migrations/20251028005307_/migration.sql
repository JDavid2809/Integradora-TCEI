/*
  Warnings:

  - You are about to drop the `PortfolioItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PortfolioItem" DROP CONSTRAINT "PortfolioItem_studentId_fkey";

-- DropTable
DROP TABLE "public"."PortfolioItem";
