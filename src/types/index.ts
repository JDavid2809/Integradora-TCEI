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
      verificado?: boolean;
      debe_cambiar_password?: boolean;
      extra?: {
        id_profesor?: number;
        id_estudiante?: number;
        [key: string]: string | number | boolean | undefined;
      } | null;
    };
  }

  interface User {
    id: string; // 
    apellido?: string | null; // 
    rol: "ADMIN" | "PROFESOR" | "ESTUDIANTE";
    debe_cambiar_password?: boolean;
    extra?: {
      id_profesor?: number;
      id_estudiante?: number;
      [key: string]: string | number | boolean | undefined;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string; // 
    apellido?: string | null; // 
    rol: "ADMIN" | "PROFESOR" | "ESTUDIANTE";
    debe_cambiar_password?: boolean;
    extra?: {
      id_profesor?: number;
      id_estudiante?: number;
      [key: string]: string | number | boolean | undefined;
    } | null;
  }
}
console.log(NextAuth);


export interface FormValues {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  password: string;
  confirmPassword: string;
  terms? : boolean;
}


//user profile studen
export interface dataProfileStudent {
  
        email: string;
        nombre: string;
        id_estudiante: number;
        paterno: string;
        materno: string;
        telefono: string;
        edad: number;
        descripcion?: string;
    }

export interface UserStudent {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  estudiante?: {
      id_estudiante: number;
      nombre: string;
      paterno: string ;
      materno: string ;
        email: string;
        telefono: string ;
        edad: number;
        descripcion?: string ;
       
    } 
  }