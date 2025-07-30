/*
  Warnings:

  - You are about to drop the column `telefonos` on the `profesor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "estudiante" ADD COLUMN     "materno" VARCHAR(30),
ADD COLUMN     "paterno" VARCHAR(30);

-- AlterTable
ALTER TABLE "profesor" DROP COLUMN "telefonos",
ADD COLUMN     "edad" INTEGER,
ADD COLUMN     "telefono" VARCHAR(25),
ALTER COLUMN "paterno" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "materno" SET DATA TYPE VARCHAR(30);
