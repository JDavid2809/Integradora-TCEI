
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';




const prisma = new PrismaClient();


async function main(){
    try {
          const hashedPassword = await bcrypt.hash("12345", 10);

    const nuevoProfesor = await prisma.usuario.create({
      data: {
        nombre: `Mario`,
        email: "mario@gmail.com",
        apellido: "Perez Gomez",
        password: hashedPassword,
        rol: "PROFESOR",
        profesor: {
          create: {
            nombre: `Mario `,
           
          
          paterno       : 'perez',
          
          materno         : 'gomez',
          curp            : 'PEJA010101HDFRRS09',
          rfc            : 'PEJA010101',
          direccion       : 'Calle Falsa 123',
          telefono      : '5551234567',
          nivel_estudios  : 'Licenciatura',
          observaciones   : 'Profesor de matemáticas',
          b_activo     : true,
          edad: 30, // Edad del profesor


          },
        },
      },
    });

    const nuevoEstudiante = await prisma.usuario.create({
      data: {
        nombre: `Estudiante Test`,
        email: "estudiante@test.com",
        password: hashedPassword,
        apellido: "Perez Gomez",
        rol: "ESTUDIANTE",
        estudiante: {
          create: {
            nombre: `Juan  Test`,
            paterno: 'Perez',
            materno: 'Gomez',
            edad: 18,
            email: "estudiante@test.com",
            telefono: "2341698756",
            
        
            
            b_activo: true,
          },
        },
      },
    });
    
    } catch (error) {
        console.error("Error during seeding:", error);
    }
}

main()
  .then( async ()=>{
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error in main function:", e);
    await prisma.$disconnect();
  })

  
  
