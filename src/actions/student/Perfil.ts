"use server";
import { prisma } from "@/lib/prisma";
import { dataProfileStudent } from "@/types";

export async function updateStudentProfile(data: dataProfileStudent) {
  if (!data.id_estudiante) {
    throw new Error("id_estudiante es obligatorio");
  }


    const estudiante = await prisma.estudiante.update({
    where: { id_estudiante: data.id_estudiante },
    data: {
      nombre: data.nombre,
      paterno: data.paterno,
      materno: data.materno,
      email: data.email,
      telefono: data.telefono,
      edad: data.edad,
      descripcion: data.descripcion,
      usuario:{
        update: {
          nombre: data.nombre,
          email: data.email,
          apellido: `${data.paterno} ${data.materno}`
        }
      }
    },
  });

  

  if (!estudiante) {
    throw new Error("No se pudo actualizar el estudiante");
  }

   return estudiante;


 
}
