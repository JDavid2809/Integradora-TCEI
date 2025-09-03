"use server";

import { prisma } from "@/lib/prisma";

export async function confirmarUsuario(token: string) {
  const user = await prisma.usuario.findFirst({
    where: { tokenVerif: token },
  });

  if (!user) throw new Error("Token inválido");
  if (!user.expiraEn || user.expiraEn < new Date()) throw new Error("Token expirado");

  await prisma.usuario.update({
    where: { id: user.id },
    data: { verificado: true, tokenVerif: null, expiraEn: null },
  });

  return true;
}
