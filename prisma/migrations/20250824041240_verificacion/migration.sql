/*
  Warnings:

  - You are about to drop the `VerificacionToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."VerificacionToken" DROP CONSTRAINT "VerificacionToken_usuarioId_fkey";

-- AlterTable
ALTER TABLE "public"."usuario" ADD COLUMN     "expiraEn" TIMESTAMP(3),
ADD COLUMN     "tokenVerif" TEXT,
ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."VerificacionToken";
