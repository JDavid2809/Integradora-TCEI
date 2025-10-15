/*
  Warnings:

  - You are about to drop the `Inscripcion` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."PaymentStatus" ADD VALUE 'FREE';

-- DropForeignKey
ALTER TABLE "public"."Inscripcion" DROP CONSTRAINT "Inscripcion_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Inscripcion" DROP CONSTRAINT "Inscripcion_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance" DROP CONSTRAINT "attendance_inscripcion_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_enrollment_id_fkey";

-- DropTable
DROP TABLE "public"."Inscripcion";

-- CreateTable
CREATE TABLE "public"."inscripciones" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inscripciones_student_id_idx" ON "public"."inscripciones"("student_id");

-- CreateIndex
CREATE INDEX "inscripciones_course_id_idx" ON "public"."inscripciones"("course_id");

-- CreateIndex
CREATE INDEX "inscripciones_status_idx" ON "public"."inscripciones"("status");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_student_id_course_id_key" ON "public"."inscripciones"("student_id", "course_id");

-- AddForeignKey
ALTER TABLE "public"."inscripciones" ADD CONSTRAINT "inscripciones_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inscripciones" ADD CONSTRAINT "inscripciones_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."inscripciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "public"."inscripciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
