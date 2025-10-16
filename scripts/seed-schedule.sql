-- Seed data para horarios de clases
-- Este script agrega datos de ejemplo para el sistema de horarios

-- Insertar niveles si no existen
INSERT INTO nivel (nombre, b_activo) 
VALUES 
  ('A1', true),
  ('A2', true), 
  ('B1', true),
  ('B2', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar profesores de ejemplo si no existen
-- (Asumiendo que ya existen usuarios y profesores)

-- Insertar horarios de clase (class_schedules) para los cursos existentes
-- Curso 1: Inglés Básico A1
INSERT INTO class_schedule (course_id, teacher_id, level_id, day_of_week, start_time, duration_minutes, classroom, is_active)
SELECT 
  1, -- course_id (Inglés Básico A1)
  p.id_profesor,
  n.id_nivel,
  'MONDAY',
  '09:00',
  90,
  'Aula 101',
  true
FROM profesor p
CROSS JOIN nivel n
WHERE p.id_profesor = 1 AND n.nombre = 'A1'
ON CONFLICT DO NOTHING;

INSERT INTO class_schedule (course_id, teacher_id, level_id, day_of_week, start_time, duration_minutes, classroom, is_active)
SELECT 
  1, -- course_id (Inglés Básico A1)
  p.id_profesor,
  n.id_nivel,
  'WEDNESDAY',
  '09:00',
  90,
  'Aula 101',
  true
FROM profesor p
CROSS JOIN nivel n
WHERE p.id_profesor = 1 AND n.nombre = 'A1'
ON CONFLICT DO NOTHING;

INSERT INTO class_schedule (course_id, teacher_id, level_id, day_of_week, start_time, duration_minutes, classroom, is_active)
SELECT 
  1, -- course_id (Inglés Básico A1)
  p.id_profesor,
  n.id_nivel,
  'FRIDAY',
  '09:00',
  90,
  'Aula 101',
  true
FROM profesor p
CROSS JOIN nivel n
WHERE p.id_profesor = 1 AND n.nombre = 'A1'
ON CONFLICT DO NOTHING;

-- Curso 2: Inglés Intermedio B1
INSERT INTO class_schedule (course_id, teacher_id, level_id, day_of_week, start_time, duration_minutes, classroom, is_active)
SELECT 
  2, -- course_id (Inglés Intermedio B1)
  p.id_profesor,
  n.id_nivel,
  'TUESDAY',
  '14:00',
  120,
  'Aula 202',
  true
FROM profesor p
CROSS JOIN nivel n
WHERE p.id_profesor = 1 AND n.nombre = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO class_schedule (course_id, teacher_id, level_id, day_of_week, start_time, duration_minutes, classroom, is_active)
SELECT 
  2, -- course_id (Inglés Intermedio B1)
  p.id_profesor,
  n.id_nivel,
  'THURSDAY',
  '14:00',
  120,
  'Aula 202',
  true
FROM profesor p
CROSS JOIN nivel n
WHERE p.id_profesor = 1 AND n.nombre = 'B1'
ON CONFLICT DO NOTHING;

-- Insertar algunas actividades de ejemplo
INSERT INTO course_activity (course_id, title, description, activity_type, due_date, total_points, is_published, created_by, created_at, updated_at)
SELECT 
  1,
  'Vocabulario Básico - Familia',
  'Completa los ejercicios sobre vocabulario de la familia',
  'ASSIGNMENT',
  CURRENT_DATE + INTERVAL '3 days',
  100,
  true,
  p.id_profesor,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM profesor p
WHERE p.id_profesor = 1
ON CONFLICT DO NOTHING;

INSERT INTO course_activity (course_id, title, description, activity_type, due_date, total_points, is_published, created_by, created_at, updated_at)
SELECT 
  1,
  'Quiz: Present Simple',
  'Evaluación sobre el tiempo presente simple',
  'QUIZ',
  CURRENT_DATE + INTERVAL '5 days',
  50,
  true,
  p.id_profesor,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM profesor p
WHERE p.id_profesor = 1
ON CONFLICT DO NOTHING;

INSERT INTO course_activity (course_id, title, description, activity_type, due_date, total_points, is_published, created_by, created_at, updated_at)
SELECT 
  2,
  'Ensayo: Mi ciudad natal',
  'Escribe un ensayo de 300 palabras sobre tu ciudad natal',
  'ASSIGNMENT',
  CURRENT_DATE + INTERVAL '7 days',
  200,
  true,
  p.id_profesor,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM profesor p
WHERE p.id_profesor = 1
ON CONFLICT DO NOTHING;

INSERT INTO course_activity (course_id, title, description, activity_type, due_date, total_points, is_published, created_by, created_at, updated_at)
SELECT 
  2,
  'Video: Presentación Personal',
  'Graba un video de 3 minutos presentándote en inglés',
  'VIDEO',
  CURRENT_DATE + INTERVAL '10 days',
  150,
  true,
  p.id_profesor,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM profesor p
WHERE p.id_profesor = 1
ON CONFLICT DO NOTHING;