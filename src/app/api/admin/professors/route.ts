import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const professors = await prisma.usuario.findMany({
      where: {
        rol: 'PROFESOR'
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        verificado: true
      },
      orderBy: {
        nombre: 'asc'
      }
    })

    return NextResponse.json(professors)
  } catch (error) {
    console.error('Error al obtener profesores:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      nombre, 
      apellido, 
      email, 
      password 
    } = body

    // Validaciones básicas
    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Crear nuevo profesor
    const newProfessor = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        password, // En producción, esto debería hashearse
        rol: 'PROFESOR',
        verificado: false
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        verificado: true
      }
    })

    return NextResponse.json(newProfessor, { status: 201 })
  } catch (error) {
    console.error('Error al crear profesor:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}