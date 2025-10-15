import { prisma } from '../src/lib/prisma'

async function seedScheduleData() {
  try {
    console.log('🌱 Seeding schedule data...')

    // 1. Ensure levels exist
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    for (const levelName of levels) {
      await prisma.nivel.upsert({
        where: { nombre: levelName },
        update: {},
        create: {
          nombre: levelName,
          b_activo: true
        }
      })
    }
    console.log('✅ Levels created/updated')

    // 2. Get existing courses and teachers
    const courses = await prisma.curso.findMany({
      include: {
        imparte: {
          include: {
            profesor: true,
            nivel: true
          }
        }
      }
    })

    if (courses.length === 0) {
      console.log('❌ No courses found. Please seed courses first.')
      return
    }

    const levels_db = await prisma.nivel.findMany()
    
    // 3. Create class schedules for each course
    for (const course of courses) {
      if (course.imparte.length > 0) {
        const imparte = course.imparte[0] // Use first teacher for the course
        const level = levels_db.find(l => l.nombre === 'A1') || levels_db[0]

        // Create schedules based on course name
        let schedules = []
        
        if (course.nombre.toLowerCase().includes('básico') || course.nombre.toLowerCase().includes('a1')) {
          schedules = [
            { day: 'MONDAY', time: '09:00', duration: 90, classroom: 'Aula 101' },
            { day: 'WEDNESDAY', time: '09:00', duration: 90, classroom: 'Aula 101' },
            { day: 'FRIDAY', time: '09:00', duration: 90, classroom: 'Aula 101' }
          ]
        } else if (course.nombre.toLowerCase().includes('intermedio') || course.nombre.toLowerCase().includes('b1')) {
          schedules = [
            { day: 'TUESDAY', time: '14:00', duration: 120, classroom: 'Aula 202' },
            { day: 'THURSDAY', time: '14:00', duration: 120, classroom: 'Aula 202' }
          ]
        } else {
          // Default schedule for other courses
          schedules = [
            { day: 'MONDAY', time: '16:00', duration: 90, classroom: 'Aula 103' },
            { day: 'WEDNESDAY', time: '16:00', duration: 90, classroom: 'Aula 103' }
          ]
        }

        for (const schedule of schedules) {
          try {
            await prisma.class_schedule.create({
              data: {
                course_id: course.id_curso,
                teacher_id: imparte.id_profesor,
                level_id: level.id_nivel,
                day_of_week: schedule.day as any,
                start_time: schedule.time,
                duration_minutes: schedule.duration,
                classroom: schedule.classroom,
                is_active: true
              }
            })
          } catch (error) {
            // Ignore if already exists
            console.log(`Schedule for ${course.nombre} on ${schedule.day} already exists`)
          }
        }
      }
    }
    console.log('✅ Class schedules created')

    // 4. Create sample activities
    for (const course of courses) {
      if (course.imparte.length > 0) {
        const teacher_id = course.imparte[0].id_profesor

        const activities = [
          {
            title: `Vocabulario - ${course.nombre}`,
            description: 'Completa los ejercicios de vocabulario asignados',
            activity_type: 'ASSIGNMENT',
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            total_points: 100
          },
          {
            title: `Quiz - ${course.nombre}`,
            description: 'Evaluación sobre los temas vistos en clase',
            activity_type: 'QUIZ',
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            total_points: 50
          },
          {
            title: `Proyecto Final - ${course.nombre}`,
            description: 'Proyecto integrador del curso',
            activity_type: 'PROJECT',
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            total_points: 200
          }
        ]

        for (const activity of activities) {
          try {
            await prisma.course_activity.create({
              data: {
                course_id: course.id_curso,
                title: activity.title,
                description: activity.description,
                activity_type: activity.activity_type as any,
                due_date: activity.due_date,
                total_points: activity.total_points,
                is_published: true,
                created_by: teacher_id
              }
            })
          } catch (error) {
            // Ignore if already exists
            console.log(`Activity "${activity.title}" for course ${course.nombre} already exists`)
          }
        }
      }
    }
    console.log('✅ Course activities created')

    console.log('🎉 Schedule seed data completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding schedule data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedScheduleData()