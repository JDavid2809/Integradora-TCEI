"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
// Image removed from register page per instruction (logo kept in navbar only)
import { registerUser } from "@/actions/auth/Auth-actions";
import { useForm } from "react-hook-form";
import { FormValues } from "@/types";
import Error from "../../../../docs/ui/Error";

interface RegisterFormProps {
  toggleMode: () => void;
}

export default function RegisterForm({ toggleMode }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };
  const [errorMessage, setErrorMessage] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [error, setError] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setErrorMessage("");
    setError(false);

    try {
      const {success, message} = await registerUser(data);

      if (success) {
        setMensaje(message);
        setError(false);
        reset();
      } else {
        setErrorMessage(message);
        setError(true);
        setMensaje("");
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
        {/* Mobile header */}
        <motion.div
          variants={itemVariants}
          className="lg:hidden flex items-center justify-center space-x-3 mb-8"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#e30f28] to-[#00246a] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <h1 className="text-xl font-bold text-[#00246a] dark:text-blue-100 text-center">
            Triunfando con el Inglés
          </h1>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#00246a] dark:text-blue-100 mb-2">
            Crea tu cuenta
          </h2>
          <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500">
            Comienza tu aventura aprendiendo inglés
          </p>
        </motion.div>

        {/* Form */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6 text-center"
          >
            {errorMessage}
          </motion.div>
        )}
        {mensaje && (
          <motion.div
            variants={itemVariants}
            className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6 text-center"
          >
            {mensaje}
          </motion.div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <motion.div variants={itemVariants} className="gap-4">
            <div className="space-y-2">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-[#00246a]"
              >
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                placeholder="Juan"
                className={`w-full h-12 px-4 border rounded-xl transition-all duration-200 ${
                  errors.nombre
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 dark:border-slate-700 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10"
                }`}
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                  minLength: {
                    value: 2,
                    message: "Debe tener al menos 2 caracteres",
                  },
                })}
              />
              {errors.nombre && (
                <Error>{errors.nombre.message}</Error>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="apellidoPaterno"
                className="block text-sm font-medium text-[#00246a]"
              >
                Apellido Paterno
              </label>
              <input
                id="apellidoPaterno"
                type="text"
                placeholder="Pérez"
                className={`w-full h-12 px-4 border rounded-xl transition-all duration-200 ${
                  errors.apellidoPaterno
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 dark:border-slate-700 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10"
                }`}
                {...register("apellidoPaterno", {
                  required: "El apellido paterno es obligatorio",
                  minLength: {
                    value: 2,
                    message: "Debe tener al menos 2 caracteres",
                  },
                })}
              />
              {errors.apellidoPaterno && (
                <Error>{errors.apellidoPaterno.message}</Error>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="apellidoMaterno"
                className="block text-sm font-medium text-[#00246a]"
              >
                Apellido Materno
              </label>
              <input
                id="apellidoMaterno"
                type="text"
                placeholder="Gómez"
                className={`w-full h-12 px-4 border rounded-xl transition-all duration-200 ${
                  errors.apellidoMaterno
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 dark:border-slate-700 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10"
                }`}
                {...register("apellidoMaterno", {
                  required: "El apellido materno es obligatorio",
                  minLength: {
                    value: 2,
                    message: "Debe tener al menos 2 caracteres",
                  },
                })}
              />
              {errors.apellidoMaterno && (
                <Error>{errors.apellidoMaterno.message}</Error>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#00246a]"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className={`w-full h-12 px-4 border rounded-xl transition-all duration-200 ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 dark:border-slate-700 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10"
              }`}
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: { value: /\S+@\S+\.\S+/, message: "Correo no válido" },
              })}
            />
            {errors.email && (
              <Error>{errors.email.message}</Error>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-[#00246a]"
            >
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              placeholder="123-456-7890"
              className={`w-full h-12 px-4 border rounded-xl transition-all duration-200 ${
                errors.telefono
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 dark:border-slate-700 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10"
              }`}
              {...register("telefono", {
                required: "El teléfono es obligatorio",
                pattern: {
                  value: /^[0-9-+()\s]*$/,
                  message: "Teléfono no válido",
                },
                minLength: {
                  value: 10,
                  message: "Debe tener al menos 10 caracteres",
                },
                maxLength: {
                  value: 15,
                  message: "Debe tener como máximo 15 caracteres",
                },
              })}
            />
            {errors.telefono && (
              <Error>{errors.telefono.message}</Error>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#00246a]"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full h-12 px-4 pr-12 border rounded-xl transition-all duration-200 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 dark:border-slate-700 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10"
                }`}
                 {...register("password", {
    required: "La contraseña es obligatoria",
    minLength: {
      value: 8,
      message: "Debe tener al menos 8 caracteres",
    },
    validate: {
      hasUpperCase: (value) =>
        /[A-Z]/.test(value) || "Debe contener al menos una mayúscula",
      hasLowerCase: (value) =>
        /[a-z]/.test(value) || "Debe contener al menos una minúscula",
      hasNumber: (value) =>
        /\d/.test(value) || "Debe contener al menos un número",
      hasSpecialChar: (value) =>
        /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
        "Debe contener al menos un carácter especial",
    },
  })}
               />
             

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                )}
              </button>
            </div>
               {errors.password && (
                    <Error>{errors.password.message}</Error>
                )}
           
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#00246a]"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full h-12 px-4 pr-12 border rounded-xl transition-all duration-200 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 dark:border-slate-700 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10"
                }`}
                {...register("confirmPassword", {
                  required: "Debes confirmar tu contraseña",
                })}
              />
              

              <button
                type="button"
                className="absolute right-3  top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                )}
              </button>
            </div>
            {errors.password && (
                <Error>{errors.password.message}</Error>
              )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#e30f28] dark:bg-slate-800 focus:ring-[#e30f28]/20 mt-1"
              />
              <span className="text-sm text-slate-600 leading-relaxed">
                Acepto los{" "}
                <a
                  href="#"
                  className="text-[#e30f28] hover:text-[#e30f28]/80 transition-colors font-medium"
                >
                  términos y condiciones
                </a>{" "}
                y la{" "}
                <a
                  href="#"
                  className="text-[#e30f28] hover:text-[#e30f28]/80 transition-colors font-medium"
                >
                  política de privacidad
                </a>
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#e30f28] dark:bg-slate-800 focus:ring-[#e30f28]/20 mt-1"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                Quiero recibir noticias y ofertas especiales por email
              </span>
            </label>
          </motion.div>

          <motion.button
            variants={itemVariants}
            type="submit"
            className="w-full h-12 bg-[#e30f28] hover:bg-[#e30f28]/90 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
          >
            Crear Cuenta
          </motion.button>
        </form>

        {/* Divider */}
        <motion.div variants={itemVariants} className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">
              O regístrate con
            </span>
          </div>
        </motion.div>

        {/* Social buttons */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-8"
        >
          <button className="h-12 w-full max-w-xs border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 rounded-xl flex items-center justify-center space-x-2 text-slate-700 dark:text-slate-300">
            <svg className="w-5 h-5 text-[#e30f28]" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
          
        </motion.div>

        {/* Toggle */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={toggleMode}
              className="text-[#e30f28] hover:text-[#e30f28]/80 transition-colors font-medium hover:underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
