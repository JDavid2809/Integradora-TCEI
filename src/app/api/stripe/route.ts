import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Manejar el evento de pago completado
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const courseId = parseInt(session.metadata!.course_id)
      const userId = parseInt(session.metadata!.userId)

      console.log('💳 Processing payment for:', { courseId, userId, sessionId: session.id })

      // Buscar el estudiante por el ID del usuario
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { estudiante: true }
      })

      if (!user || !user.estudiante) {
        console.error('❌ Student not found for user:', userId)
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }

      const studentId = user.estudiante.id_estudiante

      // Verificar si ya existe una inscripción
      const existingEnrollment = await prisma.inscripcion.findFirst({
        where: {
          student_id: studentId,
          course_id: courseId
        }
      })

      if (existingEnrollment) {
        console.log('ℹ️ Enrollment already exists for student:', studentId, 'in course:', courseId)
        return NextResponse.json({ 
          message: 'Enrollment already exists',
          enrollment: existingEnrollment 
        })
      }

      // Crear la inscripción
      const enrollment = await prisma.inscripcion.create({
        data: {
          student_id: studentId,
          course_id: courseId,
          enrolled_at: new Date(),
          status: 'ACTIVE',
          payment_status: 'PAID',
          notes: `Pago procesado vía Stripe - Session: ${session.id} - Amount: $${(session.amount_total! / 100).toFixed(2)} MXN`
        }
      })

      console.log('✅ Enrollment created successfully:', {
        enrollmentId: enrollment.id,
        studentId,
        courseId,
        sessionId: session.id
      })

      // Opcional: Enviar email de confirmación
      // await sendEnrollmentConfirmationEmail(user.email, courseId)

      return NextResponse.json({ 
        success: true,
        enrollment,
        message: 'Enrollment created successfully'
      })

    } catch (error) {
      console.error('❌ Error creating enrollment:', error)
      return NextResponse.json({ 
        error: 'Error creating enrollment',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }

  // Otros eventos que podrías manejar
  if (event.type === 'payment_intent.payment_failed') {
    console.log('❌ Payment failed:', event.data.object.id)
  }

  return NextResponse.json({ received: true })
}