'use server'


import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { FormValues } from "@/types";
import bcrypt from "bcryptjs";
import { ResetEmail, sendVerificationEmail } from "@/lib/mailer";


export async function registerUser(formData: FormValues) {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, email, telefono, password, confirmPassword } = formData;

    if (!nombre || !apellidoPaterno || !apellidoMaterno || !email || !telefono || !password || !confirmPassword) {
      throw new Error("Todos los campos son obligatorios.");
    }

    if (!/^\d{10}$/.test(telefono)) throw new Error("Teléfono inválido.");
    if (!email.includes("@") || !email.includes(".")) throw new Error("Correo inválido.");
    if (password !== confirmPassword) throw new Error("Contraseñas no coinciden.");

    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) throw new Error("Ya existe una cuenta con este correo.");

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido: `${apellidoPaterno} ${apellidoMaterno}`,
        email,
        password: hashedPassword,
        rol: "ESTUDIANTE",
        estudiante: {
          create: {
            nombre,
            paterno: apellidoPaterno,
            materno: apellidoMaterno,
            email,
            telefono,
            edad: 18,
            b_activo: true,
          },
        },
      },
    });


    const token = randomBytes(32).toString("hex");
    const expiraEn = new Date(Date.now() + 60 * 60 * 24 * 1000); // 24 horas

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tokenVerif: token, expiraEn },
    });
    await sendVerificationEmail(email, token, usuario.nombre);


    return { success: true, message: "Registro exitoso. Revisa tu correo para verificar tu cuenta." };

  } catch (error) {
    console.error("Error al registrar:", error);
    return { success: false, message: (error as Error).message };
  }
}



export async function sendResetPassword(email: string) {
  const user = await prisma.usuario.findUnique({ where: { email } })
  if (!user) return "Si el correo existe, recibirás un enlace"

  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prisma.usuario.update({
    where: { email },
    data: { tokenVerif: token, expiraEn: expiresAt },
  })



  const Url = `${process.env.NEXT_PUBLIC_URL}/Login/restablecer-password?token=${token}`

  await ResetEmail(email, user.nombre, Url)



  return "Si el correo existe, recibirás un enlace"
}



export async function resendVerification(email: string) {
  const user = await prisma.usuario.findUnique({ where: { email } });

  if (!user) throw new Error("No existe una cuenta con este correo.");
  if (user.verificado) throw new Error("Esta cuenta ya está verificada.");

  // Generar nuevo token
  const token = randomBytes(32).toString("hex");
  const expiraEn = new Date(Date.now() + 60 * 60 * 24 * 1000); // 24h

  await prisma.usuario.update({
    where: { id: user.id },
    data: { tokenVerif: token, expiraEn },
  });

  await sendVerificationEmail(user.email, token, user.nombre);

  return { success: true, message: "Hemos enviado un nuevo correo de verificación." };
}