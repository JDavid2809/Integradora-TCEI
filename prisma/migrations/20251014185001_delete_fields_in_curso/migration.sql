/*
  Warnings:

  - You are about to drop the column `stripe_priceid` on the `curso` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_productid` on the `curso` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."curso_stripe_productid_key";

-- AlterTable
ALTER TABLE "public"."curso" DROP COLUMN "stripe_priceid",
DROP COLUMN "stripe_productid";
