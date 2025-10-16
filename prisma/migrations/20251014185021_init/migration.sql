-- CreateEnum
CREATE TYPE "public"."TipoCapturo" AS ENUM ('PROFESOR', 'USER');

-- CreateEnum
CREATE TYPE "public"."TipoEvaluacion" AS ENUM ('PARCIAL', 'FINAL');

-- CreateEnum
CREATE TYPE "public"."TipoEvaluacionExamen" AS ENUM ('ORD', 'RE', 'EX', 'EX2');

-- CreateEnum
CREATE TYPE "public"."TipoImparte" AS ENUM ('PRESENCIAL', 'ONLINE');

-- CreateEnum
CREATE TYPE "public"."Recurrencia" AS ENUM ('UNICO', 'PERIODICO');

-- CreateEnum
CREATE TYPE "public"."PagoTipo" AS ENUM ('Mensualidad');

-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('ADMIN', 'PROFESOR', 'ESTUDIANTE');

-- CreateEnum
CREATE TYPE "public"."Modalidad" AS ENUM ('PRESENCIAL', 'ONLINE');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'ONLINE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "public"."TipoChatRoom" AS ENUM ('GENERAL', 'CLASE', 'PRIVADO', 'SOPORTE');

-- CreateEnum
CREATE TYPE "public"."TipoMensaje" AS ENUM ('TEXTO', 'IMAGEN', 'ARCHIVO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('ASSIGNMENT', 'QUIZ', 'PROJECT', 'READING', 'VIDEO', 'PRACTICE', 'DISCUSSION', 'EXAM');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED', 'LATE', 'MISSING');

-- CreateEnum
CREATE TYPE "public"."EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "public"."estudiante" (
    "id_estudiante" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "edad" INTEGER NOT NULL,
    "id_categoria_edad" INTEGER,
    "b_activo" BOOLEAN DEFAULT true,
    "id_usuario" INTEGER NOT NULL,
    "materno" VARCHAR(30),
    "paterno" VARCHAR(30),
    "descripcion" VARCHAR(255),

    CONSTRAINT "estudiante_pkey" PRIMARY KEY ("id_estudiante")
);

-- CreateTable
CREATE TABLE "public"."categoria_edad" (
    "id_categoria_edad" SERIAL NOT NULL,
    "rango" VARCHAR(50) NOT NULL,
    "b_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categoria_edad_pkey" PRIMARY KEY ("id_categoria_edad")
);

-- CreateTable
CREATE TABLE "public"."examen" (
    "id_examen" SERIAL NOT NULL,
    "id_nivel" INTEGER,
    "nombre" VARCHAR(100) NOT NULL,
    "b_activo" BOOLEAN DEFAULT true,

    CONSTRAINT "examen_pkey" PRIMARY KEY ("id_examen")
);

-- CreateTable
CREATE TABLE "public"."historial_academico" (
    "id_historial" SERIAL NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "id_imparte" INTEGER NOT NULL,
    "id_capturo" INTEGER NOT NULL,
    "tipo_capturo" "public"."TipoCapturo",
    "calificacion" DOUBLE PRECISION,
    "fecha" DATE,
    "tipo" "public"."TipoEvaluacion",
    "comentario" TEXT,
    "asistencia" DOUBLE PRECISION,
    "tipo_evaluacion" "public"."TipoEvaluacionExamen",

    CONSTRAINT "historial_academico_pkey" PRIMARY KEY ("id_historial")
);

-- CreateTable
CREATE TABLE "public"."horario" (
    "id_horario" SERIAL NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "horario_pkey" PRIMARY KEY ("id_horario")
);

-- CreateTable
CREATE TABLE "public"."horario_detalle" (
    "id_imparte" INTEGER NOT NULL,
    "id_horario" INTEGER NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "horario_detalle_pkey" PRIMARY KEY ("id_imparte","id_horario")
);

-- CreateTable
CREATE TABLE "public"."horario_pred" (
    "id_horario_pred" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "comentario" TEXT,

    CONSTRAINT "horario_pred_pkey" PRIMARY KEY ("id_horario_pred")
);

-- CreateTable
CREATE TABLE "public"."horario_pred_detalle" (
    "id_detalle" SERIAL NOT NULL,
    "id_imparte" INTEGER NOT NULL,
    "id_horario_pred" INTEGER NOT NULL,

    CONSTRAINT "horario_pred_detalle_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "public"."imparte" (
    "id_imparte" SERIAL NOT NULL,
    "id_profesor" INTEGER NOT NULL,
    "id_nivel" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "dias" VARCHAR(12),
    "hora_inicio" INTEGER,
    "duracion_min" INTEGER,
    "tipo" "public"."TipoImparte",

    CONSTRAINT "imparte_pkey" PRIMARY KEY ("id_imparte")
);

-- CreateTable
CREATE TABLE "public"."imparte_calendario_remota" (
    "id_calendario_remota" SERIAL NOT NULL,
    "id_imparte" INTEGER NOT NULL,
    "hora_inicio" TEXT,
    "duracion_minutos" INTEGER,
    "url" VARCHAR(60),
    "fecha" DATE,
    "tema" VARCHAR(30),
    "recurrencia" "public"."Recurrencia",

    CONSTRAINT "imparte_calendario_remota_pkey" PRIMARY KEY ("id_calendario_remota")
);

-- CreateTable
CREATE TABLE "public"."imparte_registro_remota" (
    "id_registro" SERIAL NOT NULL,
    "id_estudiante" INTEGER NOT NULL,
    "id_calendario_remota" INTEGER NOT NULL,
    "fecha_ingreso" TIMESTAMP(3),

    CONSTRAINT "imparte_registro_remota_pkey" PRIMARY KEY ("id_registro")
);

-- CreateTable
CREATE TABLE "public"."nivel" (
    "id_nivel" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "b_activo" BOOLEAN DEFAULT true,

    CONSTRAINT "nivel_pkey" PRIMARY KEY ("id_nivel")
);

-- CreateTable
CREATE TABLE "public"."pago" (
    "id_pago" SERIAL NOT NULL,
    "id_estudiante" INTEGER,
    "id_imparte" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "tipo" "public"."PagoTipo" NOT NULL,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "public"."pregunta" (
    "id_pregunta" SERIAL NOT NULL,
    "id_examen" INTEGER,
    "descripcion" TEXT NOT NULL,
    "ruta_file_media" VARCHAR(100),

    CONSTRAINT "pregunta_pkey" PRIMARY KEY ("id_pregunta")
);

-- CreateTable
CREATE TABLE "public"."profesor" (
    "id_profesor" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "paterno" VARCHAR(30),
    "materno" VARCHAR(30),
    "curp" VARCHAR(20),
    "rfc" VARCHAR(14),
    "direccion" VARCHAR(30),
    "nivel_estudios" VARCHAR(30),
    "observaciones" VARCHAR(50),
    "b_activo" BOOLEAN DEFAULT true,
    "id_usuario" INTEGER NOT NULL,
    "edad" INTEGER,
    "telefono" VARCHAR(25),

    CONSTRAINT "profesor_pkey" PRIMARY KEY ("id_profesor")
);

-- CreateTable
CREATE TABLE "public"."respuesta" (
    "id_respuesta" SERIAL NOT NULL,
    "id_pregunta" INTEGER,
    "descripcion" TEXT NOT NULL,
    "ruta_file_media" VARCHAR(100),
    "es_correcta" BOOLEAN NOT NULL,

    CONSTRAINT "respuesta_pkey" PRIMARY KEY ("id_respuesta")
);

-- CreateTable
CREATE TABLE "public"."resultado_examen" (
    "id_resultado" SERIAL NOT NULL,
    "id_estudiante" INTEGER,
    "id_examen" INTEGER,
    "calificacion" DECIMAL(5,2) NOT NULL,
    "fecha" DATE NOT NULL,

    CONSTRAINT "resultado_examen_pkey" PRIMARY KEY ("id_resultado")
);

-- CreateTable
CREATE TABLE "public"."Administrador" (
    "id_administrador" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "nombre" VARCHAR(25),
    "image" VARCHAR(50) NOT NULL,
    "email_unico" VARCHAR(200),
    "b_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id_administrador")
);

-- CreateTable
CREATE TABLE "public"."usuario" (
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" "public"."Rol" NOT NULL,
    "id" SERIAL NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "tokenVerif" TEXT,
    "expiraEn" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."curso" (
    "id_curso" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "modalidad" "public"."Modalidad" NOT NULL,
    "inicio" DATE,
    "fin" DATE,
    "b_activo" BOOLEAN DEFAULT true,
    "course_content" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "descripcion" TEXT,
    "features" TEXT,
    "requirements" TEXT,
    "resumen" TEXT,
    "target_audience" TEXT,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "what_you_learn" TEXT,
    "precio" DECIMAL(10,2),
    "nivel_ingles" VARCHAR(20),
    "duracion_horas" INTEGER,
    "certificado" BOOLEAN DEFAULT true,

    CONSTRAINT "curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "public"."Inscripcion" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "notes" TEXT,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance" (
    "id" SERIAL NOT NULL,
    "class_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL,
    "notes" TEXT,
    "recorded_by" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inscripcion_id" INTEGER NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_schedule" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "level_id" INTEGER NOT NULL,
    "day_of_week" "public"."DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "classroom" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "class_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_room" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "tipo" "public"."TipoChatRoom" NOT NULL DEFAULT 'GENERAL',
    "creado_por" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chat_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_participant" (
    "id" SERIAL NOT NULL,
    "chat_room_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "unido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_visto" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chat_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_message" (
    "id" SERIAL NOT NULL,
    "chat_room_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" "public"."TipoMensaje" NOT NULL DEFAULT 'TEXTO',
    "archivo_url" VARCHAR(255),
    "archivo_nombre" VARCHAR(100),
    "enviado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editado_en" TIMESTAMP(3),
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "entregado_en" TIMESTAMP(3),
    "visto_en" TIMESTAMP(3),

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_message_read" (
    "id" SERIAL NOT NULL,
    "mensaje_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "leido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_read_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_activity" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "activity_type" "public"."ActivityType" NOT NULL DEFAULT 'ASSIGNMENT',
    "due_date" TIMESTAMP(3),
    "total_points" INTEGER NOT NULL DEFAULT 100,
    "min_passing_score" INTEGER,
    "allow_late" BOOLEAN NOT NULL DEFAULT false,
    "late_penalty" INTEGER,
    "max_attempts" INTEGER DEFAULT 1,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_attachment" (
    "id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_submission" (
    "id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "submission_text" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_late" BOOLEAN NOT NULL DEFAULT false,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" INTEGER,
    "feedback" TEXT,
    "graded_by" INTEGER,
    "graded_at" TIMESTAMP(3),

    CONSTRAINT "activity_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submission_file" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_file_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "estudiante_email_key" ON "public"."estudiante"("email");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_id_usuario_key" ON "public"."estudiante"("id_usuario");

-- CreateIndex
CREATE INDEX "estudiante_id_categoria_edad_idx" ON "public"."estudiante"("id_categoria_edad");

-- CreateIndex
CREATE INDEX "examen_id_nivel_idx" ON "public"."examen"("id_nivel");

-- CreateIndex
CREATE INDEX "historial_academico_id_estudiante_idx" ON "public"."historial_academico"("id_estudiante");

-- CreateIndex
CREATE INDEX "historial_academico_id_capturo_idx" ON "public"."historial_academico"("id_capturo");

-- CreateIndex
CREATE INDEX "historial_academico_id_imparte_idx" ON "public"."historial_academico"("id_imparte");

-- CreateIndex
CREATE INDEX "horario_id_estudiante_idx" ON "public"."horario"("id_estudiante");

-- CreateIndex
CREATE INDEX "horario_id_curso_idx" ON "public"."horario"("id_curso");

-- CreateIndex
CREATE INDEX "horario_detalle_id_horario_idx" ON "public"."horario_detalle"("id_horario");

-- CreateIndex
CREATE INDEX "horario_pred_id_curso_idx" ON "public"."horario_pred"("id_curso");

-- CreateIndex
CREATE INDEX "horario_pred_detalle_id_horario_pred_idx" ON "public"."horario_pred_detalle"("id_horario_pred");

-- CreateIndex
CREATE INDEX "horario_pred_detalle_id_imparte_idx" ON "public"."horario_pred_detalle"("id_imparte");

-- CreateIndex
CREATE INDEX "imparte_id_profesor_idx" ON "public"."imparte"("id_profesor");

-- CreateIndex
CREATE INDEX "imparte_id_nivel_idx" ON "public"."imparte"("id_nivel");

-- CreateIndex
CREATE INDEX "imparte_id_curso_idx" ON "public"."imparte"("id_curso");

-- CreateIndex
CREATE INDEX "imparte_calendario_remota_id_imparte_idx" ON "public"."imparte_calendario_remota"("id_imparte");

-- CreateIndex
CREATE INDEX "imparte_registro_remota_id_calendario_remota_idx" ON "public"."imparte_registro_remota"("id_calendario_remota");

-- CreateIndex
CREATE INDEX "imparte_registro_remota_id_estudiante_idx" ON "public"."imparte_registro_remota"("id_estudiante");

-- CreateIndex
CREATE UNIQUE INDEX "nivel_nombre_key" ON "public"."nivel"("nombre");

-- CreateIndex
CREATE INDEX "pago_id_estudiante_idx" ON "public"."pago"("id_estudiante");

-- CreateIndex
CREATE INDEX "pago_id_imparte_idx" ON "public"."pago"("id_imparte");

-- CreateIndex
CREATE INDEX "pregunta_id_examen_idx" ON "public"."pregunta"("id_examen");

-- CreateIndex
CREATE UNIQUE INDEX "profesor_id_usuario_key" ON "public"."profesor"("id_usuario");

-- CreateIndex
CREATE INDEX "respuesta_id_pregunta_idx" ON "public"."respuesta"("id_pregunta");

-- CreateIndex
CREATE INDEX "resultado_examen_id_estudiante_idx" ON "public"."resultado_examen"("id_estudiante");

-- CreateIndex
CREATE INDEX "resultado_examen_id_examen_idx" ON "public"."resultado_examen"("id_examen");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_id_usuario_key" ON "public"."Administrador"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "public"."usuario"("email");

-- CreateIndex
CREATE INDEX "curso_created_by_idx" ON "public"."curso"("created_by");

-- CreateIndex
CREATE INDEX "Inscripcion_student_id_idx" ON "public"."Inscripcion"("student_id");

-- CreateIndex
CREATE INDEX "Inscripcion_course_id_idx" ON "public"."Inscripcion"("course_id");

-- CreateIndex
CREATE INDEX "Inscripcion_status_idx" ON "public"."Inscripcion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_student_id_course_id_key" ON "public"."Inscripcion"("student_id", "course_id");

-- CreateIndex
CREATE INDEX "payment_enrollment_id_idx" ON "public"."payment"("enrollment_id");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "public"."payment"("status");

-- CreateIndex
CREATE INDEX "attendance_inscripcion_id_idx" ON "public"."attendance"("inscripcion_id");

-- CreateIndex
CREATE INDEX "attendance_class_date_idx" ON "public"."attendance"("class_date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_inscripcion_id_class_date_key" ON "public"."attendance"("inscripcion_id", "class_date");

-- CreateIndex
CREATE INDEX "class_schedule_course_id_idx" ON "public"."class_schedule"("course_id");

-- CreateIndex
CREATE INDEX "class_schedule_teacher_id_idx" ON "public"."class_schedule"("teacher_id");

-- CreateIndex
CREATE INDEX "class_schedule_day_of_week_idx" ON "public"."class_schedule"("day_of_week");

-- CreateIndex
CREATE INDEX "Review_course_id_idx" ON "public"."Review"("course_id");

-- CreateIndex
CREATE INDEX "Review_student_id_idx" ON "public"."Review"("student_id");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "public"."Review"("rating");

-- CreateIndex
CREATE INDEX "Review_created_at_idx" ON "public"."Review"("created_at");

-- CreateIndex
CREATE INDEX "Review_is_active_idx" ON "public"."Review"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Review_course_id_student_id_key" ON "public"."Review"("course_id", "student_id");

-- CreateIndex
CREATE INDEX "chat_room_creado_por_idx" ON "public"."chat_room"("creado_por");

-- CreateIndex
CREATE INDEX "chat_participant_chat_room_id_idx" ON "public"."chat_participant"("chat_room_id");

-- CreateIndex
CREATE INDEX "chat_participant_usuario_id_idx" ON "public"."chat_participant"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participant_chat_room_id_usuario_id_key" ON "public"."chat_participant"("chat_room_id", "usuario_id");

-- CreateIndex
CREATE INDEX "chat_message_chat_room_id_idx" ON "public"."chat_message"("chat_room_id");

-- CreateIndex
CREATE INDEX "chat_message_usuario_id_idx" ON "public"."chat_message"("usuario_id");

-- CreateIndex
CREATE INDEX "chat_message_enviado_en_idx" ON "public"."chat_message"("enviado_en");

-- CreateIndex
CREATE INDEX "chat_message_read_mensaje_id_idx" ON "public"."chat_message_read"("mensaje_id");

-- CreateIndex
CREATE INDEX "chat_message_read_usuario_id_idx" ON "public"."chat_message_read"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_message_read_mensaje_id_usuario_id_key" ON "public"."chat_message_read"("mensaje_id", "usuario_id");

-- CreateIndex
CREATE INDEX "course_activity_course_id_idx" ON "public"."course_activity"("course_id");

-- CreateIndex
CREATE INDEX "course_activity_created_by_idx" ON "public"."course_activity"("created_by");

-- CreateIndex
CREATE INDEX "course_activity_due_date_idx" ON "public"."course_activity"("due_date");

-- CreateIndex
CREATE INDEX "course_activity_is_published_idx" ON "public"."course_activity"("is_published");

-- CreateIndex
CREATE INDEX "course_activity_activity_type_idx" ON "public"."course_activity"("activity_type");

-- CreateIndex
CREATE INDEX "activity_attachment_activity_id_idx" ON "public"."activity_attachment"("activity_id");

-- CreateIndex
CREATE INDEX "activity_submission_activity_id_idx" ON "public"."activity_submission"("activity_id");

-- CreateIndex
CREATE INDEX "activity_submission_student_id_idx" ON "public"."activity_submission"("student_id");

-- CreateIndex
CREATE INDEX "activity_submission_enrollment_id_idx" ON "public"."activity_submission"("enrollment_id");

-- CreateIndex
CREATE INDEX "activity_submission_status_idx" ON "public"."activity_submission"("status");

-- CreateIndex
CREATE INDEX "activity_submission_submitted_at_idx" ON "public"."activity_submission"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "activity_submission_activity_id_student_id_attempt_number_key" ON "public"."activity_submission"("activity_id", "student_id", "attempt_number");

-- CreateIndex
CREATE INDEX "submission_file_submission_id_idx" ON "public"."submission_file"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_profesor_email_key" ON "public"."solicitud_profesor"("email");

-- CreateIndex
CREATE INDEX "solicitud_profesor_email_idx" ON "public"."solicitud_profesor"("email");

-- CreateIndex
CREATE INDEX "solicitud_profesor_estado_idx" ON "public"."solicitud_profesor"("estado");

-- CreateIndex
CREATE INDEX "solicitud_profesor_fecha_solicitud_idx" ON "public"."solicitud_profesor"("fecha_solicitud");

-- AddForeignKey
ALTER TABLE "public"."estudiante" ADD CONSTRAINT "estudiante_id_categoria_edad_fkey" FOREIGN KEY ("id_categoria_edad") REFERENCES "public"."categoria_edad"("id_categoria_edad") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estudiante" ADD CONSTRAINT "estudiante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examen" ADD CONSTRAINT "examen_id_nivel_fkey" FOREIGN KEY ("id_nivel") REFERENCES "public"."nivel"("id_nivel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historial_academico" ADD CONSTRAINT "historial_academico_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historial_academico" ADD CONSTRAINT "historial_academico_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "public"."imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario" ADD CONSTRAINT "horario_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario" ADD CONSTRAINT "horario_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario_detalle" ADD CONSTRAINT "horario_detalle_id_horario_fkey" FOREIGN KEY ("id_horario") REFERENCES "public"."horario"("id_horario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario_detalle" ADD CONSTRAINT "horario_detalle_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "public"."imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario_pred" ADD CONSTRAINT "horario_pred_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario_pred_detalle" ADD CONSTRAINT "horario_pred_detalle_id_horario_pred_fkey" FOREIGN KEY ("id_horario_pred") REFERENCES "public"."horario_pred"("id_horario_pred") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario_pred_detalle" ADD CONSTRAINT "horario_pred_detalle_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "public"."imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imparte" ADD CONSTRAINT "imparte_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imparte" ADD CONSTRAINT "imparte_id_nivel_fkey" FOREIGN KEY ("id_nivel") REFERENCES "public"."nivel"("id_nivel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imparte" ADD CONSTRAINT "imparte_id_profesor_fkey" FOREIGN KEY ("id_profesor") REFERENCES "public"."profesor"("id_profesor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imparte_calendario_remota" ADD CONSTRAINT "imparte_calendario_remota_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "public"."imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imparte_registro_remota" ADD CONSTRAINT "imparte_registro_remota_id_calendario_remota_fkey" FOREIGN KEY ("id_calendario_remota") REFERENCES "public"."imparte_calendario_remota"("id_calendario_remota") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imparte_registro_remota" ADD CONSTRAINT "imparte_registro_remota_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pago" ADD CONSTRAINT "pago_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pago" ADD CONSTRAINT "pago_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "public"."imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pregunta" ADD CONSTRAINT "pregunta_id_examen_fkey" FOREIGN KEY ("id_examen") REFERENCES "public"."examen"("id_examen") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profesor" ADD CONSTRAINT "profesor_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respuesta" ADD CONSTRAINT "respuesta_id_pregunta_fkey" FOREIGN KEY ("id_pregunta") REFERENCES "public"."pregunta"("id_pregunta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resultado_examen" ADD CONSTRAINT "resultado_examen_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resultado_examen" ADD CONSTRAINT "resultado_examen_id_examen_fkey" FOREIGN KEY ("id_examen") REFERENCES "public"."examen"("id_examen") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Administrador" ADD CONSTRAINT "Administrador_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curso" ADD CONSTRAINT "curso_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profesor"("id_profesor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "public"."Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profesor"("id_profesor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_schedule" ADD CONSTRAINT "class_schedule_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_schedule" ADD CONSTRAINT "class_schedule_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."nivel"("id_nivel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_schedule" ADD CONSTRAINT "class_schedule_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profesor"("id_profesor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_room" ADD CONSTRAINT "chat_room_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_participant" ADD CONSTRAINT "chat_participant_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_participant" ADD CONSTRAINT "chat_participant_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_message" ADD CONSTRAINT "chat_message_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_message" ADD CONSTRAINT "chat_message_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_message_read" ADD CONSTRAINT "chat_message_read_mensaje_id_fkey" FOREIGN KEY ("mensaje_id") REFERENCES "public"."chat_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_message_read" ADD CONSTRAINT "chat_message_read_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_activity" ADD CONSTRAINT "course_activity_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_activity" ADD CONSTRAINT "course_activity_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profesor"("id_profesor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_attachment" ADD CONSTRAINT "activity_attachment_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."course_activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_submission" ADD CONSTRAINT "activity_submission_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."course_activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_submission" ADD CONSTRAINT "activity_submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_submission" ADD CONSTRAINT "activity_submission_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_submission" ADD CONSTRAINT "activity_submission_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "public"."profesor"("id_profesor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_file" ADD CONSTRAINT "submission_file_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."activity_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitud_profesor" ADD CONSTRAINT "solicitud_profesor_id_revisor_fkey" FOREIGN KEY ("id_revisor") REFERENCES "public"."Administrador"("id_administrador") ON DELETE SET NULL ON UPDATE CASCADE;
