/*
  Warnings:

  - You are about to drop the column `enrollment_id` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the `enrollment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[inscripcion_id,class_date]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inscripcion_id` to the `attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."attendance" DROP CONSTRAINT "attendance_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."enrollment" DROP CONSTRAINT "enrollment_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."enrollment" DROP CONSTRAINT "enrollment_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_enrollment_id_fkey";

-- DropIndex
DROP INDEX "public"."attendance_enrollment_id_class_date_key";

-- DropIndex
DROP INDEX "public"."attendance_enrollment_id_idx";

-- AlterTable
ALTER TABLE "public"."attendance" DROP COLUMN "enrollment_id",
ADD COLUMN     "inscripcion_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."enrollment";

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

-- CreateIndex
CREATE INDEX "attendance_inscripcion_id_idx" ON "public"."attendance"("inscripcion_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_inscripcion_id_class_date_key" ON "public"."attendance"("inscripcion_id", "class_date");

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "public"."Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "public"."Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
