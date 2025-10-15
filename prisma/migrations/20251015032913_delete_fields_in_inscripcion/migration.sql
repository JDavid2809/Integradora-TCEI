/*
  Warnings:

  - You are about to drop the `inscripciones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."attendance" DROP CONSTRAINT "attendance_inscripcion_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."inscripciones" DROP CONSTRAINT "inscripciones_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."inscripciones" DROP CONSTRAINT "inscripciones_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_enrollment_id_fkey";

-- DropTable
DROP TABLE "public"."inscripciones";

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

-- CreateIndex
CREATE INDEX "Inscripcion_student_id_idx" ON "public"."Inscripcion"("student_id");

-- CreateIndex
CREATE INDEX "Inscripcion_course_id_idx" ON "public"."Inscripcion"("course_id");

-- CreateIndex
CREATE INDEX "Inscripcion_status_idx" ON "public"."Inscripcion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_student_id_course_id_key" ON "public"."Inscripcion"("student_id", "course_id");

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "public"."Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
