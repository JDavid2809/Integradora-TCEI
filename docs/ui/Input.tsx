"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { confirmarUsuario } from "@/actions/auth/ConfirmAuth";
import { CheckCircleIcon, XCircleIcon, Loader2 } from "lucide-react";

interface ConfirmPageProps {
  token?: string;
}

export default function ConfirmPage({ token }: ConfirmPageProps) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState("Verificando tu cuenta...");
  const [estado, setEstado] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setMensaje("Token inválido. Redirigiendo al login...");
      setEstado("error");
      setTimeout(() => router.push("/Login"), 2000);
      return;
    }

    const verify = async () => {
      try {
        await confirmarUsuario(token);
        setMensaje("¡Cuenta verificada! Redirigiendo al login...");
        setEstado("success");
        setTimeout(() => router.push("/Login"), 2000);
      } catch (error) {
        setMensaje("Token inválido. Redirigiendo al login...");
        setEstado("error");
        console.error("Error al verificar token:", error);
        setTimeout(() => router.push("/Login"), 2000);
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center mt-16  px-4">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg 
                      p-10 w-full max-w-md flex flex-col items-center gap-6 text-center">
        
        {/* Icono */}
        {estado === "loading" && (
          <Loader2 className="w-16 h-16 text-purple-600 dark:text-purple-400 animate-spin" />
        )}
        {estado === "success" && (
          <CheckCircleIcon className="w-16 h-16 text-green-500 dark:text-green-400" />
        )}
        {estado === "error" && (
          <XCircleIcon className="w-16 h-16 text-red-500 dark:text-red-400" />
        )}

        {/* Mensaje */}
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {mensaje}
        </h1>

        {/* Botón solo en éxito */}
        {estado === "success" && (
          <button
            onClick={() => router.push("/Login")}
            className="mt-2 px-5 py-2.5 bg-purple-600 dark:bg-purple-500 text-white font-medium rounded-lg 
                       shadow hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
          >
            Ir al login
          </button>
        )}
      </div>
    </div>
  );
}
