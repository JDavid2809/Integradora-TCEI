import { prisma } from '../src/lib/prisma'

async function seedChatData() {
  console.log('🌱 Seeding chat data...')

  try {
    // Obtener usuarios existentes
    const users = await prisma.usuario.findMany({
      take: 3
    })

    if (users.length < 2) {
      console.log('❌ Se necesitan al menos 2 usuarios para crear datos de chat')
      return
    }

    // Crear sala general si no existe
    let generalRoom = await prisma.chat_room.findFirst({
      where: { nombre: 'General', tipo: 'GENERAL' }
    })

    if (!generalRoom) {
      generalRoom = await prisma.chat_room.create({
        data: {
          nombre: 'General',
          descripcion: 'Sala de chat general para todos los usuarios',
          tipo: 'GENERAL',
          creado_por: users[0].id
        }
      })
      console.log('✅ Sala General creada')
    }

    // Crear sala de soporte si no existe
    let supportRoom = await prisma.chat_room.findFirst({
      where: { nombre: 'Soporte', tipo: 'SOPORTE' }
    })

    if (!supportRoom) {
      supportRoom = await prisma.chat_room.create({
        data: {
          nombre: 'Soporte',
          descripcion: 'Sala de soporte técnico',
          tipo: 'SOPORTE',
          creado_por: users[0].id
        }
      })
      console.log('✅ Sala de Soporte creada')
    }

    // Crear chat privado entre usuarios
    let privateRoom = await prisma.chat_room.findFirst({
      where: { 
        tipo: 'PRIVADO',
        participantes: {
          every: {
            usuario_id: { in: [users[0].id, users[1].id] }
          }
        }
      }
    })

    if (!privateRoom) {
      privateRoom = await prisma.chat_room.create({
        data: {
          nombre: `Chat: ${users[0].nombre} - ${users[1].nombre}`,
          descripcion: 'Chat privado',
          tipo: 'PRIVADO',
          creado_por: users[0].id
        }
      })

      // Agregar participantes al chat privado
      await prisma.chat_participant.createMany({
        data: [
          { chat_room_id: privateRoom.id, usuario_id: users[0].id },
          { chat_room_id: privateRoom.id, usuario_id: users[1].id }
        ]
      })
      console.log('✅ Chat privado creado')
    }

    // Agregar participantes a salas públicas
    for (const user of users) {
      // General
      await prisma.chat_participant.upsert({
        where: {
          chat_room_id_usuario_id: {
            chat_room_id: generalRoom.id,
            usuario_id: user.id
          }
        },
        update: { activo: true },
        create: {
          chat_room_id: generalRoom.id,
          usuario_id: user.id
        }
      })

      // Soporte
      await prisma.chat_participant.upsert({
        where: {
          chat_room_id_usuario_id: {
            chat_room_id: supportRoom.id,
            usuario_id: user.id
          }
        },
        update: { activo: true },
        create: {
          chat_room_id: supportRoom.id,
          usuario_id: user.id
        }
      })
    }

    // Crear mensajes de ejemplo
    const exampleMessages = [
      {
        room: generalRoom,
        content: '¡Hola a todos! Bienvenidos al chat general 👋',
        userId: users[0].id
      },
      {
        room: generalRoom,
        content: 'Gracias por la bienvenida. ¿Cómo están hoy?',
        userId: users[1].id
      },
      {
        room: generalRoom,
        content: 'Todo bien por aquí. ¿Alguien tiene preguntas sobre las clases?',
        userId: users[2]?.id || users[0].id
      },
      {
        room: supportRoom,
        content: 'Hola, tengo una pregunta sobre el acceso a la plataforma',
        userId: users[1].id
      },
      {
        room: supportRoom,
        content: 'Hola, estoy aquí para ayudarte. ¿Cuál es tu pregunta específica?',
        userId: users[0].id
      },
      {
        room: privateRoom,
        content: 'Hey, ¿cómo vas con las tareas?',
        userId: users[0].id
      },
      {
        room: privateRoom,
        content: 'Bien, ya casi termino. ¿Y tú qué tal?',
        userId: users[1].id
      }
    ]

    for (const msgData of exampleMessages) {
      const existingMsg = await prisma.chat_message.findFirst({
        where: {
          chat_room_id: msgData.room.id,
          contenido: msgData.content,
          usuario_id: msgData.userId
        }
      })

      if (!existingMsg) {
        const message = await prisma.chat_message.create({
          data: {
            chat_room_id: msgData.room.id,
            usuario_id: msgData.userId,
            contenido: msgData.content,
            entregado_en: new Date()
          }
        })

        // Simular que algunos mensajes han sido leídos
        if (Math.random() > 0.5) {
          const otherUsers = users.filter(u => u.id !== msgData.userId)
          for (const user of otherUsers) {
            await prisma.chat_message_read.create({
              data: {
                mensaje_id: message.id,
                usuario_id: user.id,
                leido_en: new Date(Date.now() + Math.random() * 60000) // Hasta 1 minuto después
              }
            })
          }
        }
      }
    }

    console.log('✅ Mensajes de ejemplo creados')
    console.log('🎉 Datos de chat poblados exitosamente!')

  } catch (error) {
    console.error('❌ Error poblando datos de chat:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedChatData()