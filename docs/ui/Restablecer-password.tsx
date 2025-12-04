"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react" // 👁️ librería de iconos

export default  function ResetPasswordPage({ token }: { token: string }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [valid, setValid] = useState<boolean | null>(null)

 
  const router = useRouter()

  // Validar token en el servidor
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setValid(false)
        return
      }
      try {
        const res = await fetch(`/api/auth/check-token?token=${token}`)
        const data = await res.json()
        setValid(res.ok && data.valid)
      } catch {
        setValid(false)
      }
    }
    checkToken()
  }, [token])

  // Función de validación de contraseña segura
  const validatePassword = (pwd: string) => {
    const minLength = /.{8,}/
    const upperCase = /[A-Z]/
    const number = /\d/
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/
    return (
      minLength.test(pwd) &&
      upperCase.test(pwd) &&
      number.test(pwd) &&
      specialChar.test(pwd)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")

    if (!validatePassword(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Error al cambiar la contraseña")
        return
      }

      setMessage("Contraseña cambiada con éxito. Redirigiendo...")
      setTimeout(() => router.push("/Login"), 2000)
    } catch {
      setError("Error en el servidor. Intenta más tarde.")
    }
  }

  // Vista mientras valida el token
  if (valid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Validando enlace...</p>
      </div>
    )
  }

  // Vista si el token es inválido o ya se usó
  if (valid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400 font-bold">El enlace no es válido o ya fue usado.</p>
      </div>
    )
  }

  // Vista si el token es válido
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center dark:text-white">Restablecer contraseña</h1>

        {/* Input nueva contraseña */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 rounded-lg pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Input confirmar contraseña */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 rounded-lg pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Cambiar contraseña
        </button>

        {/* Mensajes */}
        {message && <p className="mt-2 text-green-600 dark:text-green-400 text-center">{message}</p>}
        {error && <p className="mt-2 text-red-600 dark:text-red-400 text-center">{error}</p>}
      </form>
    </div>
  )
}
