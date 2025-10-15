/*
  Warnings:

  - A unique constraint covering the columns `[stripe_productid]` on the table `curso` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."curso" ADD COLUMN     "stripe_priceid" TEXT,
ADD COLUMN     "stripe_productid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "curso_stripe_productid_key" ON "public"."curso"("stripe_productid");
