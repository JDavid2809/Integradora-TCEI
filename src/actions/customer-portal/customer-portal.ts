'use server';

import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(courseId: number) {
  // Get authenticated user
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('You must be logged in to purchase');
  }

  // Get course from database
  const curso = await prisma.curso.findUnique({
    where: { id_curso: courseId }
  });

  if (!curso) {
    throw new Error('Course not found');
  }

  // Convert Decimal to number and validate price
  const precio = curso.precio ? Number(curso.precio) : 0;

  if (precio <= 0) {
    throw new Error('This course is not available for purchase or is free');
  }

  // Create Stripe checkout session with DIRECT price
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          unit_amount: Math.round(precio * 100), // Convert to cents
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
    // ✅ Stripe reemplaza {CHECKOUT_SESSION_ID} automáticamente
    success_url: `${process.env.NEXT_PUBLIC_URL}/Success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/Courses/${courseId}?canceled=true`,

    metadata: {
      course_id: courseId.toString(),
      course_name: curso.nombre, // ✅ Agregar nombre del curso
      userId: session.user.id,
      userEmail: session.user.email || '',
    },

    customer_email: session.user.email || undefined,
  });

  redirect(checkoutSession.url!);
}