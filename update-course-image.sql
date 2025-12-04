-- Script para agregar una imagen de prueba a un curso existente
-- Reemplaza el ID del curso y la URL de la imagen según necesites

UPDATE curso 
SET imagen_url = 'https://res.cloudinary.com/dqqqhegoa/image/upload/v1/cursos/imagenes/sample-course.jpg'
WHERE id_curso = 1;

-- Si quieres agregar a todos los cursos:
-- UPDATE curso 
-- SET imagen_url = 'https://res.cloudinary.com/dqqqhegoa/image/upload/v1/cursos/imagenes/default-course.jpg'
-- WHERE imagen_url IS NULL;
