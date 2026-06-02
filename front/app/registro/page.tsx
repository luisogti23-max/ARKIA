"use client";

import { useForm } from "react-hook-form";
import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiLogIn,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { peticionRegistro } from "@/api/peticiones";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Registro() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();
  const password = watch("password");

  const onSubmit = async (usuario) => {
    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      const respuesta = await peticionRegistro(usuario);

      if (respuesta?.error) {
        setSubmitError(respuesta.message || "Error en el registro");
        return;
      }

      if (respuesta?.data) {
        setSuccessMessage("¡Registro exitoso! Redirigiendo al login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setSubmitError("No se recibió respuesta válida del servidor");
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitError(error.message || "Error al conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registro-wrapper">
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #ffffff;
        }
      `}</style>

      <div className="registro-container">
        {/* Logo */}
        <div className="logo-section">
          <Link href="/">
            <Image
              src="/logo.jpeg"
              alt="ARK AI"
              width={180}
              height={90}
              className="logo-img"
              priority
            />
          </Link>
        </div>

        {/* Tarjeta de registro */}
        <div className="registro-card">
          <div className="card-header">
            <h1>Crear cuenta</h1>
            <p>Comienza tu experiencia con ARK AI</p>
          </div>

          {submitError && (
            <div className="alert alert-error">
              <FiAlertCircle />
              <span>{submitError}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              <FiCheckCircle />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">
                <FiUser className="label-icon" />
                Nombre de usuario
              </label>
              <input
                type="text"
                className={`form-input ${errors.username ? "error" : ""}`}
                placeholder="ej: juan_perez"
                {...register("username", {
                  required: "El nombre de usuario es requerido",
                  minLength: {
                    value: 4,
                    message: "Mínimo 4 caracteres",
                  },
                  maxLength: {
                    value: 20,
                    message: "Máximo 20 caracteres",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Solo letras, números y guión bajo",
                  },
                })}
              />
              {errors.username && (
                <span className="error-hint">{errors.username.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiMail className="label-icon" />
                Correo electrónico
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="tu@email.com"
                {...register("email", {
                  required: "El correo es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido",
                  },
                })}
              />
              {errors.email && (
                <span className="error-hint">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock className="label-icon" />
                Contraseña
              </label>
              <input
                type="password"
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="••••••••"
                {...register("password", {
                  required: "La contraseña es requerida",
                  minLength: {
                    value: 6,
                    message: "Mínimo 6 caracteres",
                  },
                  maxLength: {
                    value: 50,
                    message: "Máximo 50 caracteres",
                  },
                })}
              />
              {errors.password && (
                <span className="error-hint">{errors.password.message}</span>
              )}
              <div className="password-hint">
                <small>La contraseña debe tener al menos 6 caracteres</small>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock className="label-icon" />
                Confirmar contraseña
              </label>
              <input
                type="password"
                className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                placeholder="••••••••"
                {...register("confirmPassword", {
                  required: "Confirma tu contraseña",
                  validate: (value) =>
                    value === password || "Las contraseñas no coinciden",
                })}
              />
              {errors.confirmPassword && (
                <span className="error-hint">{errors.confirmPassword.message}</span>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register("terminos", {
                    required: "Debes aceptar los términos y condiciones",
                  })}
                />
                <span>
                  Acepto los{" "}
                  <a href="/terminos" target="_blank">
                    términos y condiciones
                  </a>
                </span>
              </label>
              {errors.terminos && (
                <span className="error-hint">{errors.terminos.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn-registro"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Creando cuenta...
                </>
              ) : (
                <>
                  Registrarse
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="login-redirect">
            <p>
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="login-link">
                Inicia sesión aquí <FiLogIn />
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-note">
          <p>Al registrarte, aceptas nuestros términos de uso y política de privacidad.</p>
        </div>
      </div>

      <style jsx>{`
        .registro-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
        }

        .registro-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        /* Logo */
        .logo-section {
          margin-bottom: 30px;
          text-align: center;
        }

        .logo-img {
          border-radius: 12px;
          transition: transform 0.3s ease;
          cursor: pointer;
        }

        .logo-img:hover {
          transform: scale(1.02);
        }

        /* Tarjeta */
        .registro-card {
          background: white;
          width: 100%;
          max-width: 480px;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .registro-card:hover {
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12);
        }

        /* Header */
        .card-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .card-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }

        .card-header p {
          color: #666;
          font-size: 14px;
        }

        /* Alertas */
        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          animation: slideIn 0.3s ease;
        }

        .alert-error {
          background: #fee;
          color: #c33;
          border-left: 4px solid #c33;
        }

        .alert-success {
          background: #e8f5e9;
          color: #2e7d32;
          border-left: 4px solid #2e7d32;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Formulario */
        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .label-icon {
          color: #ff6b00;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
        }

        .form-input.error {
          border-color: #c33;
        }

        .error-hint {
          display: block;
          font-size: 12px;
          color: #c33;
          margin-top: 6px;
        }

        .password-hint {
          margin-top: 6px;
        }

        .password-hint small {
          font-size: 11px;
          color: #999;
        }

        /* Checkbox */
        .checkbox-group {
          margin-top: 20px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 13px;
          color: #555;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #ff6b00;
        }

        .checkbox-label a {
          color: #ff6b00;
          text-decoration: none;
        }

        .checkbox-label a:hover {
          text-decoration: underline;
        }

        /* Botón */
        .btn-registro {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #ff6b00 0%, #ff8c33 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .btn-registro:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(255, 107, 0, 0.3);
        }

        .btn-registro:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Redirección al login */
        .login-redirect {
          margin-top: 24px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }

        .login-redirect p {
          font-size: 14px;
          color: #666;
        }

        .login-link {
          color: #ff6b00;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: color 0.3s;
        }

        .login-link:hover {
          color: #e05a00;
          text-decoration: underline;
        }

        /* Footer */
        .footer-note {
          margin-top: 30px;
          text-align: center;
        }

        .footer-note p {
          font-size: 11px;
          color: #999;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .registro-card {
            padding: 30px 24px;
          }

          .card-header h1 {
            font-size: 24px;
          }

          .form-input {
            padding: 10px 14px;
          }
        }
      `}</style>
    </div>
  );
}