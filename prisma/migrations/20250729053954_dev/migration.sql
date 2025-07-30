-- CreateEnum
CREATE TYPE "TipoCapturo" AS ENUM ('PROFESOR', 'USER');

-- CreateEnum
CREATE TYPE "TipoEvaluacion" AS ENUM ('PARCIAL', 'FINAL');

-- CreateEnum
CREATE TYPE "TipoEvaluacionExamen" AS ENUM ('ORD', 'RE', 'EX', 'EX2');

-- CreateEnum
CREATE TYPE "TipoImparte" AS ENUM ('PRESENCIAL', 'ONLINE');

-- CreateEnum
CREATE TYPE "Recurrencia" AS ENUM ('UNICO', 'PERIODICO');

-- CreateEnum
CREATE TYPE "PagoTipo" AS ENUM ('Mensualidad');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'PROFESOR', 'ESTUDIANTE');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('PRESENCIAL', 'ONLINE');

-- CreateTable
CREATE TABLE "estudiante" (
    "id_estudiante" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "edad" INTEGER NOT NULL,
    "id_categoria_edad" INTEGER,
    "b_activo" BOOLEAN DEFAULT true,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "estudiante_pkey" PRIMARY KEY ("id_estudiante")
);

-- CreateTable
CREATE TABLE "categoria_edad" (
    "id_categoria_edad" SERIAL NOT NULL,
    "rango" VARCHAR(50) NOT NULL,
    "b_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categoria_edad_pkey" PRIMARY KEY ("id_categoria_edad")
);

-- CreateTable
CREATE TABLE "examen" (
    "id_examen" SERIAL NOT NULL,
    "id_nivel" INTEGER,
    "nombre" VARCHAR(100) NOT NULL,
    "b_activo" BOOLEAN DEFAULT true,

    CONSTRAINT "examen_pkey" PRIMARY KEY ("id_examen")
);

-- CreateTable
CREATE TABLE "historial_academico" (
    "id_historial" SERIAL NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "id_imparte" INTEGER NOT NULL,
    "id_capturo" INTEGER NOT NULL,
    "tipo_capturo" "TipoCapturo",
    "calificacion" DOUBLE PRECISION,
    "fecha" DATE,
    "tipo" "TipoEvaluacion",
    "comentario" TEXT,
    "asistencia" DOUBLE PRECISION,
    "tipo_evaluacion" "TipoEvaluacionExamen",

    CONSTRAINT "historial_academico_pkey" PRIMARY KEY ("id_historial")
);

-- CreateTable
CREATE TABLE "horario" (
    "id_horario" SERIAL NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "horario_pkey" PRIMARY KEY ("id_horario")
);

-- CreateTable
CREATE TABLE "horario_detalle" (
    "id_imparte" INTEGER NOT NULL,
    "id_horario" INTEGER NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "horario_detalle_pkey" PRIMARY KEY ("id_imparte","id_horario")
);

-- CreateTable
CREATE TABLE "horario_pred" (
    "id_horario_pred" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "horario_pred_pkey" PRIMARY KEY ("id_horario_pred")
);

-- CreateTable
CREATE TABLE "horario_pred_detalle" (
    "id_detalle" SERIAL NOT NULL,
    "id_imparte" INTEGER NOT NULL,
    "id_horario_pred" INTEGER NOT NULL,

    CONSTRAINT "horario_pred_detalle_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "imparte" (
    "id_imparte" SERIAL NOT NULL,
    "id_profesor" INTEGER NOT NULL,
    "id_nivel" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "dias" VARCHAR(12),
    "hora_inicio" INTEGER,
    "duracion_min" INTEGER,
    "tipo" "TipoImparte",

    CONSTRAINT "imparte_pkey" PRIMARY KEY ("id_imparte")
);

-- CreateTable
CREATE TABLE "imparte_calendario_remota" (
    "id_calendario_remota" SERIAL NOT NULL,
    "id_imparte" INTEGER NOT NULL,
    "hora_inicio" TEXT,
    "duracion_minutos" INTEGER,
    "url" VARCHAR(60),
    "fecha" DATE,
    "tema" VARCHAR(30),
    "recurrencia" "Recurrencia",

    CONSTRAINT "imparte_calendario_remota_pkey" PRIMARY KEY ("id_calendario_remota")
);

-- CreateTable
CREATE TABLE "imparte_registro_remota" (
    "id_registro" SERIAL NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "id_calendario_remota" INTEGER NOT NULL,
    "fecha_ingreso" TIMESTAMP(3),

    CONSTRAINT "imparte_registro_remota_pkey" PRIMARY KEY ("id_registro")
);

-- CreateTable
CREATE TABLE "nivel" (
    "id_nivel" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "b_activo" BOOLEAN DEFAULT true,

    CONSTRAINT "nivel_pkey" PRIMARY KEY ("id_nivel")
);

-- CreateTable
CREATE TABLE "pago" (
    "id_pago" SERIAL NOT NULL,
    "id_estudiante" INTEGER,
    "id_imparte" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "tipo" "PagoTipo" NOT NULL,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "pregunta" (
    "id_pregunta" SERIAL NOT NULL,
    "id_examen" INTEGER,
    "descripcion" TEXT NOT NULL,
    "ruta_file_media" VARCHAR(100),

    CONSTRAINT "pregunta_pkey" PRIMARY KEY ("id_pregunta")
);

-- CreateTable
CREATE TABLE "profesor" (
    "id_profesor" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "paterno" VARCHAR(25),
    "materno" VARCHAR(25),
    "curp" VARCHAR(20),
    "rfc" VARCHAR(14),
    "direccion" VARCHAR(30),
    "telefonos" VARCHAR(25),
    "nivel_estudios" VARCHAR(30),
    "observaciones" VARCHAR(50),
    "b_activo" BOOLEAN DEFAULT true,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "profesor_pkey" PRIMARY KEY ("id_profesor")
);

-- CreateTable
CREATE TABLE "respuesta" (
    "id_respuesta" SERIAL NOT NULL,
    "id_pregunta" INTEGER,
    "descripcion" TEXT NOT NULL,
    "ruta_file_media" VARCHAR(100),
    "es_correcta" BOOLEAN NOT NULL,

    CONSTRAINT "respuesta_pkey" PRIMARY KEY ("id_respuesta")
);

-- CreateTable
CREATE TABLE "resultado_examen" (
    "id_resultado" SERIAL NOT NULL,
    "id_estudiante" INTEGER,
    "id_examen" INTEGER,
    "calificacion" DECIMAL(5,2) NOT NULL,
    "fecha" DATE NOT NULL,

    CONSTRAINT "resultado_examen_pkey" PRIMARY KEY ("id_resultado")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id_administrador" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "nombre" VARCHAR(25),
    "image" VARCHAR(50) NOT NULL,
    "email_unico" VARCHAR(200),
    "b_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id_administrador")
);

-- CreateTable
CREATE TABLE "usuario" (
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curso" (
    "id_curso" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
    "inicio" DATE,
    "fin" DATE,
    "b_activo" BOOLEAN DEFAULT true,

    CONSTRAINT "curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_email_key" ON "estudiante"("email");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_id_usuario_key" ON "estudiante"("id_usuario");

-- CreateIndex
CREATE INDEX "estudiante_id_categoria_edad_idx" ON "estudiante"("id_categoria_edad");

-- CreateIndex
CREATE INDEX "examen_id_nivel_idx" ON "examen"("id_nivel");

-- CreateIndex
CREATE INDEX "historial_academico_id_estudiante_idx" ON "historial_academico"("id_estudiante");

-- CreateIndex
CREATE INDEX "historial_academico_id_capturo_idx" ON "historial_academico"("id_capturo");

-- CreateIndex
CREATE INDEX "historial_academico_id_imparte_idx" ON "historial_academico"("id_imparte");

-- CreateIndex
CREATE INDEX "horario_id_estudiante_idx" ON "horario"("id_estudiante");

-- CreateIndex
CREATE INDEX "horario_id_curso_idx" ON "horario"("id_curso");

-- CreateIndex
CREATE INDEX "horario_detalle_id_horario_idx" ON "horario_detalle"("id_horario");

-- CreateIndex
CREATE INDEX "horario_pred_id_curso_idx" ON "horario_pred"("id_curso");

-- CreateIndex
CREATE INDEX "horario_pred_detalle_id_horario_pred_idx" ON "horario_pred_detalle"("id_horario_pred");

-- CreateIndex
CREATE INDEX "horario_pred_detalle_id_imparte_idx" ON "horario_pred_detalle"("id_imparte");

-- CreateIndex
CREATE INDEX "imparte_id_profesor_idx" ON "imparte"("id_profesor");

-- CreateIndex
CREATE INDEX "imparte_id_nivel_idx" ON "imparte"("id_nivel");

-- CreateIndex
CREATE INDEX "imparte_id_curso_idx" ON "imparte"("id_curso");

-- CreateIndex
CREATE INDEX "imparte_calendario_remota_id_imparte_idx" ON "imparte_calendario_remota"("id_imparte");

-- CreateIndex
CREATE INDEX "imparte_registro_remota_id_calendario_remota_idx" ON "imparte_registro_remota"("id_calendario_remota");

-- CreateIndex
CREATE INDEX "imparte_registro_remota_id_estudiante_idx" ON "imparte_registro_remota"("id_estudiante");

-- CreateIndex
CREATE UNIQUE INDEX "nivel_nombre_key" ON "nivel"("nombre");

-- CreateIndex
CREATE INDEX "pago_id_estudiante_idx" ON "pago"("id_estudiante");

-- CreateIndex
CREATE INDEX "pago_id_imparte_idx" ON "pago"("id_imparte");

-- CreateIndex
CREATE INDEX "pregunta_id_examen_idx" ON "pregunta"("id_examen");

-- CreateIndex
CREATE UNIQUE INDEX "profesor_id_usuario_key" ON "profesor"("id_usuario");

-- CreateIndex
CREATE INDEX "respuesta_id_pregunta_idx" ON "respuesta"("id_pregunta");

-- CreateIndex
CREATE INDEX "resultado_examen_id_estudiante_idx" ON "resultado_examen"("id_estudiante");

-- CreateIndex
CREATE INDEX "resultado_examen_id_examen_idx" ON "resultado_examen"("id_examen");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_id_usuario_key" ON "Administrador"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "estudiante_id_categoria_edad_fkey" FOREIGN KEY ("id_categoria_edad") REFERENCES "categoria_edad"("id_categoria_edad") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "estudiante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examen" ADD CONSTRAINT "examen_id_nivel_fkey" FOREIGN KEY ("id_nivel") REFERENCES "nivel"("id_nivel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_academico" ADD CONSTRAINT "historial_academico_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_academico" ADD CONSTRAINT "historial_academico_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_detalle" ADD CONSTRAINT "horario_detalle_id_horario_fkey" FOREIGN KEY ("id_horario") REFERENCES "horario"("id_horario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_detalle" ADD CONSTRAINT "horario_detalle_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_pred" ADD CONSTRAINT "horario_pred_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_pred_detalle" ADD CONSTRAINT "horario_pred_detalle_id_horario_pred_fkey" FOREIGN KEY ("id_horario_pred") REFERENCES "horario_pred"("id_horario_pred") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_pred_detalle" ADD CONSTRAINT "horario_pred_detalle_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imparte" ADD CONSTRAINT "imparte_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imparte" ADD CONSTRAINT "imparte_id_nivel_fkey" FOREIGN KEY ("id_nivel") REFERENCES "nivel"("id_nivel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imparte" ADD CONSTRAINT "imparte_id_profesor_fkey" FOREIGN KEY ("id_profesor") REFERENCES "profesor"("id_profesor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imparte_calendario_remota" ADD CONSTRAINT "imparte_calendario_remota_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imparte_registro_remota" ADD CONSTRAINT "imparte_registro_remota_id_calendario_remota_fkey" FOREIGN KEY ("id_calendario_remota") REFERENCES "imparte_calendario_remota"("id_calendario_remota") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imparte_registro_remota" ADD CONSTRAINT "imparte_registro_remota_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregunta" ADD CONSTRAINT "pregunta_id_examen_fkey" FOREIGN KEY ("id_examen") REFERENCES "examen"("id_examen") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profesor" ADD CONSTRAINT "profesor_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuesta" ADD CONSTRAINT "respuesta_id_pregunta_fkey" FOREIGN KEY ("id_pregunta") REFERENCES "pregunta"("id_pregunta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultado_examen" ADD CONSTRAINT "resultado_examen_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultado_examen" ADD CONSTRAINT "resultado_examen_id_examen_fkey" FOREIGN KEY ("id_examen") REFERENCES "examen"("id_examen") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrador" ADD CONSTRAINT "Administrador_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
