import {prisma} from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return new Response(JSON.stringify({ valid: false }), { status: 400 })
  }

  const user = await prisma.usuario.findFirst({
    where: {
      tokenVerif: token,
      expiraEn: { gt: new Date() },
    },
  })

  if (!user) {
    return new Response(JSON.stringify({ valid: false }), { status: 400 })
  }

  return new Response(JSON.stringify({ valid: true }), { status: 200 })
}
