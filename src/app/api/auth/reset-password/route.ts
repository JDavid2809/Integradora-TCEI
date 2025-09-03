import {prisma} from "@/lib/prisma"
import { hash } from "bcryptjs"


export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return new Response(JSON.stringify({ message: "Datos incompletos" }), { status: 400 })
    }

    // Buscar usuario con el token y verificar que no haya expirado
    const user = await prisma.usuario.findFirst({
      where: {
        tokenVerif: token,
        expiraEn: { gt: new Date() }, // token aún válido
      },
    })

    if (!user) {
      return new Response(JSON.stringify({ message: "Enlace inválido o expirado" }), { status: 400 })
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await hash(password, 10)

    // Actualizar usuario
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        tokenVerif: null,
        expiraEn: null,
      },
    })

    return new Response(JSON.stringify({ message: "Contraseña cambiada con éxito" }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error en el servidor" }), { status: 500 })
  }
}
