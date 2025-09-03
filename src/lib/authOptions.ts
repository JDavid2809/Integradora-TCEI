import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email", placeholder: "tucorreo@ejemplo.com" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
       try {
           
        if (!credentials?.email || !credentials.password) {
          console.log('❌ Missing credentials');
          return null;
        }
        console.time("findUser");

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
            password: true,
            verificado: true,
          },
        });
        console.timeEnd("findUser");

        if (!user) {

          throw new Error("usuario no encontrado");
        }
        if (!user.verificado) {
          throw new Error("Por favor, verifica tu correo antes de iniciar sesión.");
          
        }

        console.log('👤 User found:', user.email, 'Role:', user.rol);

        console.time("bcrypt");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Correo o contraseña incorrectos");
        }

        console.timeEnd("bcrypt");
        console.log('✅ Login successful for:', user.email);

        let extraData: Record<string, unknown> | null = null;


        console.time("extraData");
        if (user.rol === "ESTUDIANTE") {
          extraData = await prisma.estudiante.findUnique({
            where: { id_usuario: user.id },
          });
        } else if (user.rol === "PROFESOR") {
          extraData = await prisma.profesor.findUnique({
            where: { id_usuario: user.id },
          });
        }

        console.timeEnd("extraData");

        // Devuelve objeto user para guardar en sesión
        return {
          id: user.id.toString(),
          name: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
          extra: extraData ? { ...extraData } : null,
        };
      } catch (error) {
        throw new Error(error!.toString());
      }

      },
    }),
  ],
 callbacks: {
  async jwt({ token, user, trigger, session }) {
    if (user) {
      // Primer login
      token.rol = user.rol;
      token.apellido = user.apellido;
      token.nombre = user.name;
      token.email = user.email;
    }

    if (trigger === "update" && session) {
      // Cuando llamas a update() desde useSession()
      if (session.nombre) token.nombre = session.nombre;
      if (session.apellido) token.apellido = session.apellido;
      if (session.email) token.email = session.email;
    }

    return token;
  },
  async session({ session, token }) {
    if (token) {
      session.user!.id = token.sub as string;
      session.user!.rol = token.rol;
      session.user!.apellido = token.apellido;
      session.user!.name = token.nombre as string;
      session.user!.email = token.email;
    }
    return session;
  },
},

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};