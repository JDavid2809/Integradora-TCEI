
'use server'


import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"


export async function registerUser(formData: FormData) {
  try {
    const entries = Object.fromEntries(formData.entries());
    const {
      nombre,
      email,
      telefono,
      password,
      confirmPassword,
      terms,
      apellidoPaterno ,
      apellidoMaterno
    } = entries as {
      nombre: string;
      apellido: string;
      email: string;
      telefono: string;
      password: string;
      confirmPassword: string;
      terms?: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };


    if (!nombre || !apellidoPaterno || !apellidoMaterno || !email || !telefono || !password || !confirmPassword) {
      throw new Error("Todos los campos son obligatorios.");
    }
 if (!/^\d{10}$/.test(telefono)) {
  throw new Error("Teléfono inválido. Debe contener exactamente 10 dígitos.");
}


    if(!email.includes("@") || !email.includes(".")  ) {
      throw new Error("Correo electrónico inválido.");
    } 

    if (password !== confirmPassword) {
      throw new Error("Las contraseñas no coinciden.");
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Ya existe una cuenta con este correo.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

     await prisma.usuario.create({
      data: {
        nombre: `${nombre}`,
        apellido: `${ apellidoPaterno} ${apellidoMaterno}`,
        email,
        password: hashedPassword,
        rol: "ESTUDIANTE",
        estudiante: {
          create: {
            nombre:nombre,
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
   console.log(terms? "Términos aceptados" : "Términos no aceptados");
    

    return { success: true, message: "Registro exitoso." }
    

  } catch (error ) {
    console.error("Error al registrar:", error);
    return { success: false, message: (error as Error).message }
  }
}
