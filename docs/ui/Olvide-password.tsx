"use client"
import { useState, FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"


interface Props {
  sendResetPassword: (email: string) => Promise<string>
}

export default function ForgotPassword({ sendResetPassword }: Props) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const msg = await sendResetPassword(email)
      setMessage(msg)
      setEmail("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado. Intenta nuevamente."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-16 flex items-center justify-center bg-gradient-to-br  p-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-slate-700"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800 dark:text-white">¿Olvidaste tu contraseña?</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            loading ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          }`}
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        <AnimatePresence>
          {message && (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 text-sm text-green-600 dark:text-green-400 text-center"
            >
              {message}
            </motion.p>
          )}
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 text-sm text-red-600 dark:text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  )
}
