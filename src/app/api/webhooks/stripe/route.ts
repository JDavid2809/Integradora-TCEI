import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// This is critical for Stripe webhooks - we need the raw body
export const runtime = 'nodejs'

// Lazy initialization to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook POST request received')
  
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    console.log('📝 Webhook details:', {
      hasBody: !!body,
      bodyLength: body.length,
      bodyPreview: body.substring(0, 100),
      hasSignature: !!signature,
      signaturePreview: signature?.substring(0, 50) + '...',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 20) + '...',
      contentType: headersList.get('content-type')
    })

    if (!signature) {
      console.error('❌ No signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: Stripe.Event
    
    // Check if we should skip verification (DEVELOPMENT ONLY)
    const skipVerification = process.env.STRIPE_SKIP_WEBHOOK_VERIFICATION === 'true'

    if (skipVerification) {
      console.log('⚠️ SKIPPING SIGNATURE VERIFICATION - DEVELOPMENT MODE ONLY')
      try {
        event = JSON.parse(body) as Stripe.Event
        console.log('✅ Event parsed (unverified):', event.type)
      } catch (parseErr) {
        console.error('❌ Cannot parse webhook body:', parseErr)
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      }
    } else {
      // Normal signature verification
      try {
        const stripe = getStripe()
        
        // Log the exact values being used for verification
        console.log('🔍 Attempting signature verification with:', {
          bodyType: typeof body,
          bodyLength: body.length,
          signatureLength: signature.length,
          secretLength: process.env.STRIPE_WEBHOOK_SECRET.length,
          secretStart: process.env.STRIPE_WEBHOOK_SECRET.substring(0, 15),
        })
        
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        )
        console.log('✅ Webhook received and verified:', event.type)
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

  console.log('📨 Processing event type:', event.type)

  // Manejar el evento de pago completado
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const courseId = parseInt(session.metadata!.course_id)
      const userId = parseInt(session.metadata!.userId)

      console.log('💳 Processing payment:', { 
        courseId, 
        userId, 
        sessionId: session.id,
        email: session.customer_details?.email 
      })

      // Buscar el estudiante
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { estudiante: true }
      })

      if (!user || !user.estudiante) {
        console.error('❌ Student not found for user:', userId)
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }

      const studentId = user.estudiante.id_estudiante

      console.log('👤 Student found:', { studentId, email: user.email })

      // Verificar si ya existe la inscripción
      const existingEnrollment = await prisma.inscripcion.findFirst({
        where: {
          student_id: studentId,
          course_id: courseId,
        }
      })

      if (existingEnrollment) {
        console.log('ℹ️ Enrollment already exists:', existingEnrollment.id)
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
          notes: `Stripe Payment - Session: ${session.id} - Amount: $${(session.amount_total! / 100).toFixed(2)} MXN`
        }
      })

      console.log('✅ Enrollment created successfully:', {
        enrollmentId: enrollment.id,
        studentId,
        courseId
      })

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

  // Alternativa: Manejar payment_intent.succeeded
  // Este evento se dispara cuando el pago se completa exitosamente
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    
    console.log('💰 Payment intent succeeded:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })

    try {
      // Necesitamos obtener la sesión de checkout para tener acceso a los metadatos
      const stripe = getStripe()
      
      // Buscar la sesión de checkout asociada a este payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1
      })

      if (sessions.data.length === 0) {
        console.log('⚠️ No checkout session found for this payment intent')
        return NextResponse.json({ received: true })
      }

      const session = sessions.data[0]
      
      if (!session.metadata?.course_id || !session.metadata?.userId) {
        console.log('⚠️ Session found but missing metadata')
        return NextResponse.json({ received: true })
      }

      const courseId = parseInt(session.metadata.course_id)
      const userId = parseInt(session.metadata.userId)

      console.log('💳 Processing payment from payment_intent:', { 
        courseId, 
        userId, 
        sessionId: session.id,
        email: session.customer_details?.email 
      })

      // Buscar el estudiante
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { estudiante: true }
      })

      if (!user || !user.estudiante) {
        console.error('❌ Student not found for user:', userId)
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }

      const studentId = user.estudiante.id_estudiante

      console.log('👤 Student found:', { studentId, email: user.email })

      // Verificar si ya existe la inscripción
      const existingEnrollment = await prisma.inscripcion.findFirst({
        where: {
          student_id: studentId,
          course_id: courseId
        }
      })

      if (existingEnrollment) {
        console.log('ℹ️ Enrollment already exists:', existingEnrollment.id)
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
          notes: `Stripe Payment - Session: ${session.id} - Amount: $${(session.amount_total! / 100).toFixed(2)} MXN`
        }
      })

      console.log('✅ Enrollment created successfully:', {
        enrollmentId: enrollment.id,
        studentId,
        courseId
      })

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

  return NextResponse.json({ received: true })
  
  } catch (error) {
    console.error('❌ Unexpected error in webhook handler:', error)
    return NextResponse.json({ 
      error: 'Webhook handler error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Endpoint de prueba para verificar que la ruta funciona
export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint is alive',
    timestamp: new Date().toISOString(),
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET
  })
}