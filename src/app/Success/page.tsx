import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import Link from 'next/link';
import { createSlug } from '@/lib/slugUtils';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;

  if (!params.session_id) {
    redirect('/');
  }

  // Retrieve session details
  const session = await stripe.checkout.sessions.retrieve(params.session_id);

  if (session.payment_status !== 'paid') {
    redirect('/Courses');
  }

  const courseId = session.metadata?.course_id;
  const courseName = session.metadata?.course_name; // ✅ Obtener nombre del curso
  const courseSlug = courseName ? createSlug(courseName) : ''; // ✅ Crear slug del curso

  // Verificar si el usuario ya tiene acceso al curso
  const userEnrollment = await prisma.inscripcion.findFirst({
    where: {
      course_id: parseInt(courseId!),
      student: {
        usuario: {
          email: session.customer_details?.email || undefined
        }
      }
    }
  })

  console.log('✅ Enrollment status:', userEnrollment ? 'Enrolled' : 'Not enrolled yet')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Gracias por tu compra, {session.customer_details?.email}
          </p>

          {/* Course Name */}
          {courseName && (
            <p className="text-md text-gray-700 font-semibold mb-6">
              Has adquirido: <span className="text-[#e30f28]">{courseName}</span>
            </p>
          )}

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">Detalles de la compra</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Curso:</span>
                <span className="font-semibold">{courseName}</span>
              </div>
              <div className="flex justify-between">
                <span>ID de orden:</span>
                <span className="font-mono text-xs">{session.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Monto:</span>
                <span className="font-semibold">
                  ${(session.amount_total! / 100).toFixed(2)} MXN
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="text-green-600 font-semibold">Pagado</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {courseId && (
              <Link
                href={`/Courses/${courseSlug}`}
                className="bg-[#e30f28] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#c20e24] transition-colors"
              >
                Ir al Curso
              </Link>
            )}
            <Link
              href="/Students?section=courses"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Mis Cursos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}