-- CreateEnum
CREATE TYPE "public"."EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "public"."solicitud_profesor" (
    "id_solicitud" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "edad" INTEGER,
    "curp" VARCHAR(20),
    "rfc" VARCHAR(14),
    "direccion" VARCHAR(255),
    "nivel_estudios" VARCHAR(100),
    "observaciones" TEXT,
    "documentos_adjuntos" TEXT,
    "estado" "public"."EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_revision" TIMESTAMP(3),
    "id_revisor" INTEGER,
    "comentario_revision" TEXT,

    CONSTRAINT "solicitud_profesor_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_profesor_email_key" ON "public"."solicitud_profesor"("email");

-- CreateIndex
CREATE INDEX "solicitud_profesor_email_idx" ON "public"."solicitud_profesor"("email");

-- CreateIndex
CREATE INDEX "solicitud_profesor_estado_idx" ON "public"."solicitud_profesor"("estado");

-- CreateIndex
CREATE INDEX "solicitud_profesor_fecha_solicitud_idx" ON "public"."solicitud_profesor"("fecha_solicitud");

-- AddForeignKey
ALTER TABLE "public"."solicitud_profesor" ADD CONSTRAINT "solicitud_profesor_id_revisor_fkey" FOREIGN KEY ("id_revisor") REFERENCES "public"."Administrador"("id_administrador") ON DELETE SET NULL ON UPDATE CASCADE;
