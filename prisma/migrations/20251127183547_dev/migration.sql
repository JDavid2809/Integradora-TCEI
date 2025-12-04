-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "ai_consent" BOOLEAN NOT NULL DEFAULT false;

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
CREATE INDEX "study_guide_student_id_idx" ON "study_guide"("student_id");

-- CreateIndex
CREATE INDEX "study_guide_created_at_idx" ON "study_guide"("created_at");

-- AddForeignKey
ALTER TABLE "study_guide" ADD CONSTRAINT "study_guide_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;
