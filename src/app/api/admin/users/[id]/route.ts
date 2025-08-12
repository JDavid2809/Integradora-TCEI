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

// GET - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)
    
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        estudiante: {
          include: {
            categoria_edad: true,
            historial_academico: {
              include: {
                imparte: {
                  include: {
                    curso: true,
                    nivel: true,
                    profesor: true
                  }
                }
              }
            },
            pago: {
              include: {
                imparte: {
                  include: {
                    curso: true
                  }
                }
              }
            },
            resultado_examen: {
              include: {
                examen: {
                  include: {
                    nivel: true
                  }
                }
              }
            }
          }
        },
        profesor: {
          include: {
            imparte: {
              include: {
                curso: true,
                nivel: true
              }
            }
          }
        },
        administrador: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      detalles: user.estudiante || user.profesor || user.administrador,
      activo: user.estudiante?.b_activo ?? user.profesor?.b_activo ?? user.administrador?.b_activo ?? true
    })

  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)
    const body = await request.json()
    const { email, password, nombre, apellido, rol, detalles, activo } = body

    // Verificar que el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        estudiante: true,
        profesor: true,
        administrador: true
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar email único si se está cambiando
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.usuario.findUnique({
        where: { email }
      })
      
      if (emailExists) {
        return NextResponse.json({ error: 'El email ya existe' }, { status: 400 })
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Preparar datos para actualizar usuario base
      const updateUserData: any = {}
      if (email) updateUserData.email = email
      if (nombre) updateUserData.nombre = nombre
      if (apellido) updateUserData.apellido = apellido
      if (rol) updateUserData.rol = rol
      if (password) {
        updateUserData.password = await bcrypt.hash(password, 12)
      }

      // Actualizar usuario base
      const updatedUser = await tx.usuario.update({
        where: { id: userId },
        data: updateUserData
      })

      // Actualizar perfil específico
      let updatedProfile = null
      switch (existingUser.rol) {
        case 'ESTUDIANTE':
          if (existingUser.estudiante) {
            const estudianteData: any = {}
            if (detalles?.nombre) estudianteData.nombre = detalles.nombre
            if (detalles?.paterno) estudianteData.paterno = detalles.paterno
            if (detalles?.materno) estudianteData.materno = detalles.materno
            if (email) estudianteData.email = email
            if (detalles?.telefono !== undefined) estudianteData.telefono = detalles.telefono
            if (detalles?.edad) estudianteData.edad = detalles.edad
            if (detalles?.id_categoria_edad !== undefined) estudianteData.id_categoria_edad = detalles.id_categoria_edad
            if (activo !== undefined) estudianteData.b_activo = activo

            updatedProfile = await tx.estudiante.update({
              where: { id_usuario: userId },
              data: estudianteData
            })
          }
          break

        case 'PROFESOR':
          if (existingUser.profesor) {
            const profesorData: any = {}
            if (detalles?.nombre) profesorData.nombre = detalles.nombre
            if (detalles?.paterno) profesorData.paterno = detalles.paterno
            if (detalles?.materno) profesorData.materno = detalles.materno
            if (detalles?.edad !== undefined) profesorData.edad = detalles.edad
            if (detalles?.curp !== undefined) profesorData.curp = detalles.curp
            if (detalles?.rfc !== undefined) profesorData.rfc = detalles.rfc
            if (detalles?.direccion !== undefined) profesorData.direccion = detalles.direccion
            if (detalles?.telefono !== undefined) profesorData.telefono = detalles.telefono
            if (detalles?.nivel_estudios !== undefined) profesorData.nivel_estudios = detalles.nivel_estudios
            if (detalles?.observaciones !== undefined) profesorData.observaciones = detalles.observaciones
            if (activo !== undefined) profesorData.b_activo = activo

            updatedProfile = await tx.profesor.update({
              where: { id_usuario: userId },
              data: profesorData
            })
          }
          break

        case 'ADMIN':
          if (existingUser.administrador) {
            const adminData: any = {}
            if (detalles?.nombre) adminData.nombre = detalles.nombre
            if (detalles?.image !== undefined) adminData.image = detalles.image
            if (detalles?.email_unico) adminData.email_unico = detalles.email_unico
            if (activo !== undefined) adminData.b_activo = activo

            updatedProfile = await tx.administrador.update({
              where: { id_usuario: userId },
              data: adminData
            })
          }
          break
      }

      return { user: updatedUser, profile: updatedProfile }
    })

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: result.user.id,
        email: result.user.email,
        nombre: result.user.nombre,
        apellido: result.user.apellido,
        rol: result.user.rol,
        detalles: result.profile
      }
    })

  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)

    // Verificar que el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Eliminar usuario (las relaciones se eliminan en cascada)
    await prisma.usuario.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
