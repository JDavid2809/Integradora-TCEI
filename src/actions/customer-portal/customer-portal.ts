'use server';


import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { createSlug } from '@/lib/slugUtils' // Importar la función de slug
import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function createCheckoutSession(courseId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('You must be logged in to purchase');
  }

  const curso = await prisma.curso.findUnique({
    where: { id_curso: courseId }
  });

  if (!curso) {
    throw new Error('Course not found');
  }

  const precio = curso.precio ? Number(curso.precio) : 0;

  if (precio <= 0) {
    throw new Error('This course is not available for purchase or is free');
  }

  // Crear slug del curso para la URL de cancelación
  const courseSlug = createSlug(curso.nombre);

  const stripe = getStripe()
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          unit_amount: Math.round(precio * 100),
          product_data: {
            name: curso.nombre,
            description: curso.descripcion || undefined,
            metadata: {
              course_id: curso.id_curso.toString(),
            }
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/Success?session_id={CHECKOUT_SESSION_ID}`,
    // Corregir URL de cancelación para usar el slug del curso
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/Courses/${courseSlug}?canceled=true`,

    metadata: {
      course_id: courseId.toString(),
      course_name: curso.nombre,
      userId: session.user.id,
      userEmail: session.user.email || '',
    },

    customer_email: session.user.email || undefined,
  });

  redirect(checkoutSession.url!);
}