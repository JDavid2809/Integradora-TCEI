import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/emailUtils";
import { NextAuthOptions } from "next-auth";

// Validar variables de entorno críticas
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not configured')
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured')
}

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
        
        // Normalizar email a minúsculas
        const normalizedEmail = normalizeEmail(credentials.email);
        console.time("findUser");

        const user = await prisma.usuario.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
            password: true,
            verificado: true,
            debe_cambiar_password: true,
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
          debe_cambiar_password: user.debe_cambiar_password,
          extra: extraData ? Object.fromEntries(
            Object.entries(extraData).map(([key, value]) => [
              key, 
              typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' 
                ? value 
                : undefined
            ])
          ) : null,
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
      token.extra = user.extra;
      token.debe_cambiar_password = user.debe_cambiar_password;
    }

    if (trigger === "update" && session) {
      // Cuando llamas a update() desde useSession()
      if (session.nombre) token.nombre = session.nombre;
      if (session.apellido) token.apellido = session.apellido;
      if (session.email) token.email = session.email;
      if (session.debe_cambiar_password !== undefined) token.debe_cambiar_password = session.debe_cambiar_password;
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
      session.user!.extra = token.extra;
      session.user!.debe_cambiar_password = token.debe_cambiar_password;
    }
    return session;
  },
},

  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: '/Login',
    signOut: '/Login',
    error: '/Login',
  },
  events: {
    async signOut({ token }) {
      // Log cuando un usuario cierra sesión
      console.log('🚪 User signed out:', token?.email)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};