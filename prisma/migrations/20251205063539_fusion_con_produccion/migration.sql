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

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'ONLINE', 'OTHER');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "TipoChatRoom" AS ENUM ('GENERAL', 'CLASE', 'PRIVADO', 'SOPORTE');

-- CreateEnum
CREATE TYPE "TipoMensaje" AS ENUM ('TEXTO', 'IMAGEN', 'ARCHIVO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ASSIGNMENT', 'QUIZ', 'PROJECT', 'READING', 'VIDEO', 'PRACTICE', 'DISCUSSION', 'EXAM');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED', 'LATE', 'MISSING');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

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
    "materno" VARCHAR(30),
    "paterno" VARCHAR(30),
    "descripcion" VARCHAR(255),

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
    "apellido" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "id" SERIAL NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT false,
    "ai_consent" BOOLEAN NOT NULL DEFAULT false,
    "tokenVerif" TEXT,
    "expiraEn" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curso" (
    "id_curso" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
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
    "imagen_url" TEXT,
    "video_url" TEXT,
    "certificado" BOOLEAN DEFAULT true,

    CONSTRAINT "curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "notes" TEXT,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "class_date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "notes" TEXT,
    "recorded_by" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inscripcion_id" INTEGER NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_schedule" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "level_id" INTEGER NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "classroom" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "class_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
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
CREATE TABLE "chat_room" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "tipo" "TipoChatRoom" NOT NULL DEFAULT 'GENERAL',
    "creado_por" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chat_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_participant" (
    "id" SERIAL NOT NULL,
    "chat_room_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "unido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_visto" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chat_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" SERIAL NOT NULL,
    "chat_room_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" "TipoMensaje" NOT NULL DEFAULT 'TEXTO',
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
CREATE TABLE "chat_message_read" (
    "id" SERIAL NOT NULL,
    "mensaje_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "leido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_read_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_activity" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "activity_type" "ActivityType" NOT NULL DEFAULT 'ASSIGNMENT',
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
CREATE TABLE "activity_attachment" (
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
CREATE TABLE "activity_submission" (
    "id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "submission_text" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_late" BOOLEAN NOT NULL DEFAULT false,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" INTEGER,
    "feedback" TEXT,
    "graded_by" INTEGER,
    "graded_at" TIMESTAMP(3),

    CONSTRAINT "activity_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_file" (
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
CREATE TABLE "solicitud_profesor" (
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
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_revision" TIMESTAMP(3),
    "id_revisor" INTEGER,
    "comentario_revision" TEXT,

    CONSTRAINT "solicitud_profesor_pkey" PRIMARY KEY ("id_solicitud")
);

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

-- CreateTable
CREATE TABLE "study_guide" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_guide_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "curso_slug_key" ON "curso"("slug");

-- CreateIndex
CREATE INDEX "curso_created_by_idx" ON "curso"("created_by");

-- CreateIndex
CREATE INDEX "Inscripcion_student_id_idx" ON "Inscripcion"("student_id");

-- CreateIndex
CREATE INDEX "Inscripcion_course_id_idx" ON "Inscripcion"("course_id");

-- CreateIndex
CREATE INDEX "Inscripcion_status_idx" ON "Inscripcion"("status");

-- CreateIndex
CREATE INDEX "Inscripcion_student_id_status_idx" ON "Inscripcion"("student_id", "status");

-- CreateIndex
CREATE INDEX "Inscripcion_course_id_status_idx" ON "Inscripcion"("course_id", "status");

-- CreateIndex
CREATE INDEX "Inscripcion_status_enrolled_at_idx" ON "Inscripcion"("status", "enrolled_at");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_student_id_course_id_key" ON "Inscripcion"("student_id", "course_id");

-- CreateIndex
CREATE INDEX "payment_enrollment_id_idx" ON "payment"("enrollment_id");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "payment"("status");

-- CreateIndex
CREATE INDEX "payment_enrollment_id_status_idx" ON "payment"("enrollment_id", "status");

-- CreateIndex
CREATE INDEX "payment_status_payment_date_idx" ON "payment"("status", "payment_date");

-- CreateIndex
CREATE INDEX "attendance_inscripcion_id_idx" ON "attendance"("inscripcion_id");

-- CreateIndex
CREATE INDEX "attendance_class_date_idx" ON "attendance"("class_date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_inscripcion_id_class_date_key" ON "attendance"("inscripcion_id", "class_date");

-- CreateIndex
CREATE INDEX "class_schedule_course_id_idx" ON "class_schedule"("course_id");

-- CreateIndex
CREATE INDEX "class_schedule_teacher_id_idx" ON "class_schedule"("teacher_id");

-- CreateIndex
CREATE INDEX "class_schedule_day_of_week_idx" ON "class_schedule"("day_of_week");

-- CreateIndex
CREATE INDEX "Review_course_id_idx" ON "Review"("course_id");

-- CreateIndex
CREATE INDEX "Review_student_id_idx" ON "Review"("student_id");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_created_at_idx" ON "Review"("created_at");

-- CreateIndex
CREATE INDEX "Review_is_active_idx" ON "Review"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Review_course_id_student_id_key" ON "Review"("course_id", "student_id");

-- CreateIndex
CREATE INDEX "chat_room_creado_por_idx" ON "chat_room"("creado_por");

-- CreateIndex
CREATE INDEX "chat_participant_chat_room_id_idx" ON "chat_participant"("chat_room_id");

-- CreateIndex
CREATE INDEX "chat_participant_usuario_id_idx" ON "chat_participant"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participant_chat_room_id_usuario_id_key" ON "chat_participant"("chat_room_id", "usuario_id");

-- CreateIndex
CREATE INDEX "chat_message_chat_room_id_idx" ON "chat_message"("chat_room_id");

-- CreateIndex
CREATE INDEX "chat_message_usuario_id_idx" ON "chat_message"("usuario_id");

-- CreateIndex
CREATE INDEX "chat_message_enviado_en_idx" ON "chat_message"("enviado_en");

-- CreateIndex
CREATE INDEX "chat_message_read_mensaje_id_idx" ON "chat_message_read"("mensaje_id");

-- CreateIndex
CREATE INDEX "chat_message_read_usuario_id_idx" ON "chat_message_read"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_message_read_mensaje_id_usuario_id_key" ON "chat_message_read"("mensaje_id", "usuario_id");

-- CreateIndex
CREATE INDEX "course_activity_course_id_idx" ON "course_activity"("course_id");

-- CreateIndex
CREATE INDEX "course_activity_created_by_idx" ON "course_activity"("created_by");

-- CreateIndex
CREATE INDEX "course_activity_due_date_idx" ON "course_activity"("due_date");

-- CreateIndex
CREATE INDEX "course_activity_is_published_idx" ON "course_activity"("is_published");

-- CreateIndex
CREATE INDEX "course_activity_activity_type_idx" ON "course_activity"("activity_type");

-- CreateIndex
CREATE INDEX "activity_attachment_activity_id_idx" ON "activity_attachment"("activity_id");

-- CreateIndex
CREATE INDEX "activity_submission_activity_id_idx" ON "activity_submission"("activity_id");

-- CreateIndex
CREATE INDEX "activity_submission_student_id_idx" ON "activity_submission"("student_id");

-- CreateIndex
CREATE INDEX "activity_submission_enrollment_id_idx" ON "activity_submission"("enrollment_id");

-- CreateIndex
CREATE INDEX "activity_submission_status_idx" ON "activity_submission"("status");

-- CreateIndex
CREATE INDEX "activity_submission_enrollment_id_status_idx" ON "activity_submission"("enrollment_id", "status");

-- CreateIndex
CREATE INDEX "activity_submission_student_id_activity_id_idx" ON "activity_submission"("student_id", "activity_id");

-- CreateIndex
CREATE INDEX "activity_submission_submitted_at_idx" ON "activity_submission"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "activity_submission_activity_id_student_id_attempt_number_key" ON "activity_submission"("activity_id", "student_id", "attempt_number");

-- CreateIndex
CREATE INDEX "submission_file_submission_id_idx" ON "submission_file"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_profesor_email_key" ON "solicitud_profesor"("email");

-- CreateIndex
CREATE INDEX "solicitud_profesor_email_idx" ON "solicitud_profesor"("email");

-- CreateIndex
CREATE INDEX "solicitud_profesor_estado_idx" ON "solicitud_profesor"("estado");

-- CreateIndex
CREATE INDEX "solicitud_profesor_fecha_solicitud_idx" ON "solicitud_profesor"("fecha_solicitud");

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

-- CreateIndex
CREATE INDEX "study_guide_student_id_idx" ON "study_guide"("student_id");

-- CreateIndex
CREATE INDEX "study_guide_created_at_idx" ON "study_guide"("created_at");

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
ALTER TABLE "horario" ADD CONSTRAINT "horario_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "horario_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_detalle" ADD CONSTRAINT "horario_detalle_id_horario_fkey" FOREIGN KEY ("id_horario") REFERENCES "horario"("id_horario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_detalle" ADD CONSTRAINT "horario_detalle_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_pred" ADD CONSTRAINT "horario_pred_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_pred_detalle" ADD CONSTRAINT "horario_pred_detalle_id_horario_pred_fkey" FOREIGN KEY ("id_horario_pred") REFERENCES "horario_pred"("id_horario_pred") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_pred_detalle" ADD CONSTRAINT "horario_pred_detalle_id_imparte_fkey" FOREIGN KEY ("id_imparte") REFERENCES "imparte"("id_imparte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imparte" ADD CONSTRAINT "imparte_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imparte" ADD CONSTRAINT "imparte_id_nivel_fkey" FOREIGN KEY ("id_nivel") REFERENCES "nivel"("id_nivel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imparte" ADD CONSTRAINT "imparte_id_profesor_fkey" FOREIGN KEY ("id_profesor") REFERENCES "profesor"("id_profesor") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "curso" ADD CONSTRAINT "curso_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profesor"("id_profesor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "profesor"("id_profesor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedule" ADD CONSTRAINT "class_schedule_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedule" ADD CONSTRAINT "class_schedule_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "nivel"("id_nivel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedule" ADD CONSTRAINT "class_schedule_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "profesor"("id_profesor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participant" ADD CONSTRAINT "chat_participant_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participant" ADD CONSTRAINT "chat_participant_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message_read" ADD CONSTRAINT "chat_message_read_mensaje_id_fkey" FOREIGN KEY ("mensaje_id") REFERENCES "chat_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message_read" ADD CONSTRAINT "chat_message_read_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_activity" ADD CONSTRAINT "course_activity_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_activity" ADD CONSTRAINT "course_activity_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profesor"("id_profesor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attachment" ADD CONSTRAINT "activity_attachment_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "course_activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_submission" ADD CONSTRAINT "activity_submission_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "course_activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_submission" ADD CONSTRAINT "activity_submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_submission" ADD CONSTRAINT "activity_submission_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_submission" ADD CONSTRAINT "activity_submission_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "profesor"("id_profesor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_file" ADD CONSTRAINT "submission_file_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "activity_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_profesor" ADD CONSTRAINT "solicitud_profesor_id_revisor_fkey" FOREIGN KEY ("id_revisor") REFERENCES "Administrador"("id_administrador") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_guide" ADD CONSTRAINT "study_guide_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;
