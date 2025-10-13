-- DropForeignKey
ALTER TABLE "public"."Inscripcion" DROP CONSTRAINT "Inscripcion_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Inscripcion" DROP CONSTRAINT "Inscripcion_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_schedule" DROP CONSTRAINT "class_schedule_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_schedule" DROP CONSTRAINT "class_schedule_level_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_schedule" DROP CONSTRAINT "class_schedule_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."horario" DROP CONSTRAINT "horario_id_curso_fkey";

-- DropForeignKey
ALTER TABLE "public"."horario" DROP CONSTRAINT "horario_id_estudiante_fkey";

-- DropForeignKey
ALTER TABLE "public"."horario_pred" DROP CONSTRAINT "horario_pred_id_curso_fkey";

-- DropForeignKey
ALTER TABLE "public"."imparte" DROP CONSTRAINT "imparte_id_curso_fkey";

-- DropForeignKey
ALTER TABLE "public"."imparte" DROP CONSTRAINT "imparte_id_nivel_fkey";

-- DropForeignKey
ALTER TABLE "public"."imparte" DROP CONSTRAINT "imparte_id_profesor_fkey";

-- AddForeignKey
ALTER TABLE "public"."horario" ADD CONSTRAINT "horario_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario" ADD CONSTRAINT "horario_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horario_pred" ADD CONSTRAINT "horario_pred_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imparte" ADD CONSTRAINT "imparte_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imparte" ADD CONSTRAINT "imparte_id_nivel_fkey" FOREIGN KEY ("id_nivel") REFERENCES "public"."nivel"("id_nivel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imparte" ADD CONSTRAINT "imparte_id_profesor_fkey" FOREIGN KEY ("id_profesor") REFERENCES "public"."profesor"("id_profesor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inscripcion" ADD CONSTRAINT "Inscripcion_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."estudiante"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

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
