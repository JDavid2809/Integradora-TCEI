-- AlterTable
ALTER TABLE "public"."curso" ADD COLUMN     "precio" DECIMAL(10,2),
ALTER COLUMN "duracion_horas" DROP DEFAULT,
ALTER COLUMN "total_ejercicios" DROP DEFAULT,
ALTER COLUMN "total_lecciones" DROP DEFAULT;
