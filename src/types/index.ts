// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    expires?: string;
    user: {
      id: string ; 
      name?: string | null;
      apellido?: string | null;
      email?: string | null;
      image?: string | null;
      rol: "ADMIN" | "PROFESOR" | "ESTUDIANTE";
    };
  }

  interface User {
    id: string; // 
    apellido?: string | null; // 
    rol: "ADMIN" | "PROFESOR" | "ESTUDIANTE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string; // 
    apellido?: string | null; // 
    rol: "ADMIN" | "PROFESOR" | "ESTUDIANTE";
  }
}
console.log(NextAuth);
