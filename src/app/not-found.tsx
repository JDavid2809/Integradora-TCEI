// app/not-found.tsx
'use client';

import AstronautIllustration from '@/components/AstronautIllustration ';
import Link from 'next/link';


export default function notFound() {
  return (
    <main className="min-h-screen w-full bg-[#0B162C] text-white overflow-hidden font-sans relative">
      <div className="container mx-auto h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-16 relative z-10">

        {/* Sección Izquierda: Texto y Botón */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start text-left lg:pr-12 mb-12 lg:mb-0">
          <h1 className="text-7xl lg:text-9xl font-extrabold leading-none tracking-tight">
            404.
          </h1>
          <h2 className="text-4xl lg:text-6xl font-bold mt-4 leading-tight">
            Perdimos <br className="hidden lg:block" />
            la señal.
          </h2>
          <p className="mt-6 text-lg text-gray-300 max-w-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <Link
            href="/"
            className="mt-10 px-8 py-4 bg-white text-[#0B162C] font-bold rounded-full hover:bg-gray-200 transition-colors duration-300"
          >
            Regresar
          </Link>
        </div>

        {/* Sección Derecha: Ilustración y Fondo Orgánico */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center">
          {/* La forma orgánica (blob) de fondo */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4 w-[150%] lg:w-[130%] aspect-square bg-[#102342] rounded-full mix-blend-screen blur-3xl opacity-70 pointer-events-none -z-10"></div>

          {/* Otra capa de blob para darle más profundidad */}
          <svg className="absolute top-0 right-0 hidden lg:block text-[#102342] w-full h-full transform translate-x-1/4 scale-150 -z-10" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M45.7,-76.3C58.9,-71.1,69.1,-58.1,77.4,-43.8C85.7,-29.5,92.1,-14.7,90.8,-0.8C89.4,13.2,80.3,26.4,71.1,38.7C61.9,51,52.7,62.4,40.3,70.5C27.9,78.6,12.3,83.5,-3.7,89.9C-19.7,96.3,-36,104.2,-49.8,97.8C-63.6,91.4,-74.8,70.7,-83.1,52.3C-91.4,33.9,-96.7,16.9,-96.4,0.2C-96.1,-16.5,-90.1,-33,-80.9,-48.4C-71.6,-63.8,-59.1,-78.1,-43.6,-82C-28.1,-85.9,-9.7,-79.4,3.4,-84.9C16.5,-90.4,32.5,-81.6,45.7,-76.3Z" transform="translate(100 100)" />
          </svg>

          {/* El componente de la ilustración del robot */}
          <div className="relative z-10 w-full max-w-md lg:max-w-xl animate-float">
            <AstronautIllustration />
          </div>
        </div>
      </div>

      {/* (Opcional) Estilos globales para la animación de flotar si no los tienes en tu CSS */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}