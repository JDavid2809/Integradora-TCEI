-- AlterTable
ALTER TABLE "public"."curso" ADD COLUMN     "acceso_movil" BOOLEAN DEFAULT true,
ADD COLUMN     "acceso_tv" BOOLEAN DEFAULT true,
ADD COLUMN     "certificado" BOOLEAN DEFAULT true,
ADD COLUMN     "duracion_horas" INTEGER DEFAULT 40,
ADD COLUMN     "recursos_descargables" BOOLEAN DEFAULT true,
ADD COLUMN     "total_ejercicios" INTEGER DEFAULT 200,
ADD COLUMN     "total_lecciones" INTEGER DEFAULT 45;
