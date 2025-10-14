-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('ASSIGNMENT', 'QUIZ', 'PROJECT', 'READING', 'VIDEO', 'PRACTICE', 'DISCUSSION', 'EXAM');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED', 'LATE', 'MISSING');

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
