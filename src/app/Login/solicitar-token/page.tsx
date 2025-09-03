"use client";

import { useState } from "react";
import { resendVerification } from "@/actions/auth/Auth-actions";
import { set } from "zod";

export default function Page() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setLoading(true);

    try {
      const res = await resendVerification(email);
      setMensaje(res.message);
      setEmail("");
    } catch (err: unknown) {
      setMensaje((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center my-20 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Reenviar verificación
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="tu@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-md
                       hover:bg-purple-700 transition-colors"
          >
            {loading ? "Enviando..." : "Reenviar correo"}
          </button>
        </form>

        {mensaje && (
          <p className="mt-4 text-center text-sm text-gray-600">{mensaje}</p>
        )}
      </div>
    </div>
  );
}
