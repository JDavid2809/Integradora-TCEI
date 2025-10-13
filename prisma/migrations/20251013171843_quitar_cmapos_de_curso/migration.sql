/*
  Warnings:

  - You are about to drop the column `acceso_movil` on the `curso` table. All the data in the column will be lost.
  - You are about to drop the column `acceso_tv` on the `curso` table. All the data in the column will be lost.
  - You are about to drop the column `recursos_descargables` on the `curso` table. All the data in the column will be lost.
  - You are about to drop the column `total_ejercicios` on the `curso` table. All the data in the column will be lost.
  - You are about to drop the column `total_lecciones` on the `curso` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."curso" DROP COLUMN "acceso_movil",
DROP COLUMN "acceso_tv",
DROP COLUMN "recursos_descargables",
DROP COLUMN "total_ejercicios",
DROP COLUMN "total_lecciones";
