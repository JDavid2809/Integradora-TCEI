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
      setError("Ocurrió un error. Intenta nuevamente."+ err)
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
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">¿Olvidaste tu contraseña?</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
              className="mt-4 text-sm text-green-600 text-center"
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
              className="mt-4 text-sm text-red-600 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  )
}
