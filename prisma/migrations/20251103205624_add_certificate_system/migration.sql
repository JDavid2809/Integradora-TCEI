-- CreateTable
CREATE TABLE "Certificado" (
    "id" SERIAL NOT NULL,
    "token_uuid" TEXT NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "inscripcion_id" INTEGER NOT NULL,
    "nombre_estudiante" VARCHAR(200) NOT NULL,
    "nombre_curso" VARCHAR(200) NOT NULL,
    "nombre_instructor" VARCHAR(200) NOT NULL,
    "duracion_horas" INTEGER,
    "nivel_ingles" VARCHAR(20),
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_finalizacion" TIMESTAMP(3) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codigo_verificacion" VARCHAR(50) NOT NULL,
    "url_verificacion" VARCHAR(255) NOT NULL,
    "es_valido" BOOLEAN NOT NULL DEFAULT true,
    "fecha_revocacion" TIMESTAMP(3),
    "motivo_revocacion" TEXT,
    "veces_visto" INTEGER NOT NULL DEFAULT 0,
    "ultima_visualizacion" TIMESTAMP(3),

    CONSTRAINT "Certificado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certificado_token_uuid_key" ON "Certificado"("token_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Certificado_inscripcion_id_key" ON "Certificado"("inscripcion_id");

-- CreateIndex
CREATE UNIQUE INDEX "Certificado_codigo_verificacion_key" ON "Certificado"("codigo_verificacion");

-- CreateIndex
CREATE UNIQUE INDEX "Certificado_url_verificacion_key" ON "Certificado"("url_verificacion");

-- CreateIndex
CREATE INDEX "Certificado_estudiante_id_idx" ON "Certificado"("estudiante_id");

-- CreateIndex
CREATE INDEX "Certificado_curso_id_idx" ON "Certificado"("curso_id");

-- CreateIndex
CREATE INDEX "Certificado_token_uuid_idx" ON "Certificado"("token_uuid");

-- CreateIndex
CREATE INDEX "Certificado_codigo_verificacion_idx" ON "Certificado"("codigo_verificacion");

-- CreateIndex
CREATE INDEX "Certificado_fecha_emision_idx" ON "Certificado"("fecha_emision");

-- CreateIndex
CREATE INDEX "Certificado_es_valido_idx" ON "Certificado"("es_valido");

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
