// /app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

type ChatRequest = { question: string };


export async function POST(req: NextRequest) {
  try {
    const { question }: ChatRequest = await req.json();
    let reply = "Lo siento, aún no tengo respuesta para eso 😅";
    let options: string[] = [];

    const q = question.toLowerCase();

    if (!question) {
      // Preguntas iniciales
      reply = "Hola 👋, ¿sobre qué quieres preguntar?";
      options = ["Servicios", "Precios", "Cómo funciona la app", "Es seguro", "Registrarse"];
    } else if (q.includes("servicios")) {
      reply = "Ofrecemos cursos de inglés, tutorías y prácticas personalizadas. ¿Quieres ver más detalles?";
      options = ["Cursos disponibles", "Tutorías", "Precios"];
    } else if (q.includes("precios")) {
      reply = "Nuestros cursos van desde $200 hasta $800 por mes, dependiendo del nivel y modalidad.";
      options = ["Cursos online", "Cursos presenciales"];
    } else if (q.includes("cómo funciona")) {
      reply = "La app funciona permitiéndote acceder a lecciones, ejercicios y tutorías en tiempo real desde cualquier dispositivo.";
      options = ["Ver tutorial", "Más información"];
    } else if (q.includes("es seguro")) {
      reply = "Sí, nuestra plataforma es completamente segura y protegemos tu información personal.";
      options = ["Política de privacidad", "Términos y condiciones"];
    } else if (q.includes("registr")) {
      reply = "Puedes registrarte desde nuestro formulario de registro en la app.";
      options = ["Ir al registro", "Ayuda con registro"];
    }

    return NextResponse.json({ reply, options });
  } catch (err) {
    return NextResponse.json({ reply: `Error en la API: ${err}`, options: [] });
  }
}
