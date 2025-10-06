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

-- CreateTable
CREATE TABLE "public"."enrollment" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,

    CONSTRAINT "enrollment_pkey" PRIMARY KEY ("id")
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
    "enrollment_id" INTEGER NOT NULL,
    "class_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL,
    "notes" TEXT,
    "recorded_by" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

-- CreateIndex
CREATE INDEX "enrollment_student_id_idx" ON "public"."enrollment"("student_id");

-- CreateIndex
CREATE INDEX "enrollment_course_id_idx" ON "public"."enrollment"("course_id");

-- CreateIndex
CREATE INDEX "enrollment_status_idx" ON "public"."enrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_student_id_course_id_key" ON "public"."enrollment"("student_id", "course_id");

-- CreateIndex
CREATE INDEX "payment_enrollment_id_idx" ON "public"."payment"("enrollment_id");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "public"."payment"("status");

-- CreateIndex
CREATE INDEX "attendance_enrollment_id_idx" ON "public"."attendance"("enrollment_id");

-- CreateIndex
CREATE INDEX "attendance_class_date_idx" ON "public"."attendance"("class_date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_enrollment_id_class_date_key" ON "public"."attendance"("enrollment_id", "class_date");

-- CreateIndex
CREATE INDEX "class_schedule_course_id_idx" ON "public"."class_schedule"("course_id");

-- CreateIndex
CREATE INDEX "class_schedule_teacher_id_idx" ON "public"."class_schedule"("teacher_id");

-- CreateIndex
CREATE INDEX "class_schedule_day_of_week_idx" ON "public"."class_schedule"("day_of_week");

-- AddForeignKey
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "enrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "enrollment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profesor"("id_profesor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_schedule" ADD CONSTRAINT "class_schedule_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_schedule" ADD CONSTRAINT "class_schedule_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profesor"("id_profesor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_schedule" ADD CONSTRAINT "class_schedule_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."nivel"("id_nivel") ON DELETE RESTRICT ON UPDATE CASCADE;
