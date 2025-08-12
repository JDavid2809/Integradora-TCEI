import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Middleware para verificar autorización de admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.rol !== 'ADMIN') {
    return false
  }
  
  return true
}

// GET - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    let whereClause: any = {}
    
    if (role && ['ADMIN', 'PROFESOR', 'ESTUDIANTE'].includes(role)) {
      whereClause.rol = role
    }

    if (search) {
      whereClause.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.usuario.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          estudiante: {
            include: {
              categoria_edad: true
            }
          },
          profesor: true,
          administrador: true
        },
        orderBy: {
          id: 'desc'
        }
      }),
      prisma.usuario.count({ where: whereClause })
    ])

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        detalles: user.estudiante || user.profesor || user.administrador,
        activo: user.estudiante?.b_activo ?? user.profesor?.b_activo ?? user.administrador?.b_activo ?? true
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, nombre, apellido, rol, detalles } = body

    if (!email || !password || !nombre || !apellido || !rol) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (!['ADMIN', 'PROFESOR', 'ESTUDIANTE'].includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya existe' }, { status: 400 })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario y perfil específico en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario base
      const newUser = await tx.usuario.create({
        data: {
          email,
          password: hashedPassword,
          nombre,
          apellido,
          rol
        }
      })

      // Crear perfil específico según el rol
      let profile = null
      switch (rol) {
        case 'ESTUDIANTE':
          profile = await tx.estudiante.create({
            data: {
              nombre: detalles?.nombre || nombre,
              paterno: detalles?.paterno || apellido,
              materno: detalles?.materno || '',
              email,
              telefono: detalles?.telefono || '',
              edad: detalles?.edad || 18,
              id_categoria_edad: detalles?.id_categoria_edad || null,
              id_usuario: newUser.id
            }
          })
          break

        case 'PROFESOR':
          profile = await tx.profesor.create({
            data: {
              nombre: detalles?.nombre || nombre,
              paterno: detalles?.paterno || apellido,
              materno: detalles?.materno || '',
              edad: detalles?.edad || null,
              curp: detalles?.curp || '',
              rfc: detalles?.rfc || '',
              direccion: detalles?.direccion || '',
              telefono: detalles?.telefono || '',
              nivel_estudios: detalles?.nivel_estudios || '',
              observaciones: detalles?.observaciones || '',
              id_usuario: newUser.id
            }
          })
          break

        case 'ADMIN':
          profile = await tx.administrador.create({
            data: {
              nombre: detalles?.nombre || nombre,
              image: detalles?.image || '/default-avatar.png',
              email_unico: detalles?.email_unico || email,
              id_usuario: newUser.id
            }
          })
          break
      }

      return { user: newUser, profile }
    })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: result.user.id,
        email: result.user.email,
        nombre: result.user.nombre,
        apellido: result.user.apellido,
        rol: result.user.rol,
        detalles: result.profile
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
