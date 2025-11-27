import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedChatRooms() {
  console.log('🌱 Seeding chat rooms...')

  try {
    // Buscar un usuario admin para crear las salas
    const adminUser = await prisma.usuario.findFirst({
      where: { rol: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('No admin user found. Skipping chat rooms seed.')
      return
    }

    // Crear salas predeterminadas
    const defaultRooms = [
      {
        nombre: 'General',
        descripcion: 'Sala de chat general para todos los usuarios',
        tipo: 'GENERAL' as const,
        creado_por: adminUser.id
      },
      {
        nombre: 'Soporte Técnico',
        descripcion: 'Canal de soporte para resolver dudas técnicas',
        tipo: 'SOPORTE' as const,
        creado_por: adminUser.id
      },
      {
        nombre: 'Estudiantes',
        descripcion: 'Espacio para que los estudiantes se comuniquen entre sí',
        tipo: 'GENERAL' as const,
        creado_por: adminUser.id
      },
      {
        nombre: 'Profesores',
        descripcion: 'Canal de comunicación para profesores',
        tipo: 'CLASE' as const,
        creado_por: adminUser.id
      }
    ]

    for (const roomData of defaultRooms) {
      // Verificar si la sala ya existe
      const existingRoom = await prisma.chat_room.findFirst({
        where: { nombre: roomData.nombre }
      })

      if (!existingRoom) {
        const room = await prisma.chat_room.create({
          data: roomData
        })

        // Agregar al admin como participante
        await prisma.chat_participant.create({
          data: {
            chat_room_id: room.id,
            usuario_id: adminUser.id
          }
        })

        // Mensaje de bienvenida
        await prisma.chat_message.create({
          data: {
            chat_room_id: room.id,
            usuario_id: adminUser.id,
            contenido: `¡Bienvenidos a ${room.nombre}! ${room.descripcion}`,
            tipo: 'SISTEMA'
          }
        })

        console.log(`Created chat room: ${room.nombre}`)
      } else {
        console.log(`⏭️  Chat room already exists: ${roomData.nombre}`)
      }
    }

    console.log('Chat rooms seeding completed!')

  } catch (error) {
    console.error('Error seeding chat rooms:', error)
    throw error
  }
}

async function main() {
  await seedChatRooms()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })