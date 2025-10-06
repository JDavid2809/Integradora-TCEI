/*
  Warnings:

  - You are about to drop the `attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `class_schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."attendance" DROP CONSTRAINT "attendance_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance" DROP CONSTRAINT "attendance_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_schedule" DROP CONSTRAINT "class_schedule_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_schedule" DROP CONSTRAINT "class_schedule_level_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_schedule" DROP CONSTRAINT "class_schedule_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."enrollment" DROP CONSTRAINT "enrollment_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."enrollment" DROP CONSTRAINT "enrollment_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_enrollment_id_fkey";

-- DropTable
DROP TABLE "public"."attendance";

-- DropTable
DROP TABLE "public"."class_schedule";

-- DropTable
DROP TABLE "public"."enrollment";

-- DropTable
DROP TABLE "public"."payment";

-- DropEnum
DROP TYPE "public"."AttendanceStatus";

-- DropEnum
DROP TYPE "public"."DayOfWeek";

-- DropEnum
DROP TYPE "public"."EnrollmentStatus";

-- DropEnum
DROP TYPE "public"."PaymentMethod";

-- DropEnum
DROP TYPE "public"."PaymentStatus";
