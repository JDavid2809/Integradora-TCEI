/*
  Warnings:

  - Added the required column `updated_at` to the `curso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."curso" ADD COLUMN     "course_content" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "features" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "resumen" TEXT,
ADD COLUMN     "target_audience" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "what_you_learn" TEXT;

-- CreateIndex
CREATE INDEX "curso_created_by_idx" ON "public"."curso"("created_by");

-- AddForeignKey
ALTER TABLE "public"."curso" ADD CONSTRAINT "curso_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profesor"("id_profesor") ON DELETE SET NULL ON UPDATE CASCADE;
