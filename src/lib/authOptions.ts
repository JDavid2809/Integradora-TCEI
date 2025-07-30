import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import  { NextAuthOptions } from "next-auth";
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email", placeholder: "tucorreo@ejemplo.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔐 Attempting login with:', credentials?.email);
        
        if (!credentials?.email || !credentials.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include:{
            estudiante: true ,
            profesor: true,
            
          }
        });

        if (!user) {
          console.log('❌ User not found:', credentials.email);
          return null;
        }

        console.log('👤 User found:', user.email, 'Role:', user.rol);

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.log('❌ Invalid password');
          return null;
        }

        console.log('✅ Login successful for:', user.email);

        // Devuelve objeto user para guardar en sesión
        return {
          id: user.id.toString(),
          name: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,

        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
        token.apellido = user.apellido;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user!.id = token.sub as string;
        session.user!.rol = token.rol;
        session.user!.apellido = token.apellido;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};