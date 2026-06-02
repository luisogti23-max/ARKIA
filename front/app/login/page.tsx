"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { peticionLogin, peticionRegistro,/* peticionRecuperarPassword*/ } from "@/api/peticiones";
import { FiUser, FiLock, FiLogIn, FiUserPlus, FiAlertCircle, FiMail, FiKey, FiArrowLeft } from "react-icons/fi";
import Image from "next/image";

export default function Login() {
  const { register, handleSubmit } = useForm<{ username: string; password: string }>();
  const { register: registerRecuperar, handleSubmit: handleSubmitRecuperar, reset: resetRecuperar } = useForm<{ email: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Verificar sesión activa al cargar el componente
  useEffect(() => {
    const checkActiveSession = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("userData");
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          const tokenTimestamp = localStorage.getItem("tokenTimestamp");
          const tokenExpiry = localStorage.getItem("tokenExpiry");
          
          // Verificar si el token ha expirado (24 horas por defecto)
          if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
            // Token expirado, cerrar sesión
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
            localStorage.removeItem("tokenTimestamp");
            localStorage.removeItem("tokenExpiry");
            setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          } else {
            // Sesión activa, redirigir según el rol
            const tipoUsuario = user.tipoUsuario;
            if (tipoUsuario?.toLowerCase() === "admin") {
              router.push("/admin");
            } else if (tipoUsuario?.toLowerCase() === "usuario") {
              router.push("/usuario");
            }
          }
        } catch (error) {
          console.error("Error al verificar sesión:", error);
        }
      }
    };
    
    checkActiveSession();
  }, [router]);

  const onSubmit = async (credenciales: { username: string; password: string }) => {
    setLoginLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const respuesta = await peticionLogin(credenciales);
      
      if (respuesta.error) {
        setError(respuesta.message);
        setLoginLoading(false);
        return;
      }

      if (respuesta.data?.token) {
        // Guardar token y datos de sesión
        localStorage.setItem("token", respuesta.data.token);
        localStorage.setItem("tokenTimestamp", Date.now().toString());
        
        // Establecer expiración de token (24 horas)
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem("tokenExpiry", expiryTime.toString());
        
        // Guardar datos del usuario
        if (respuesta.data.usuario) {
          localStorage.setItem("userData", JSON.stringify(respuesta.data.usuario));
        }
        
        const tipoUsuario = respuesta.data.usuario?.tipoUsuario;
        console.log("Tipo de usuario para redirección:", tipoUsuario);
        
        if (!tipoUsuario) {
          throw new Error("No se recibió tipo de usuario");
        }

        // Redirección según rol
        if (tipoUsuario.toLowerCase() === "admin") {
          router.push("/admin");
        } else if (tipoUsuario.toLowerCase() === "usuario") {
          router.push("/usuario");
        } else {
          console.error("Tipo de usuario desconocido:", tipoUsuario);
          setError(`Tipo de usuario no reconocido: ${tipoUsuario}`);
        }
      }
    } catch (error) {
      console.error("Error en el login:", error);
      setError(error instanceof Error ? error.message : "Usuario o contraseña incorrectos");
    } finally {
      setLoginLoading(false);
    }
  };

  /*const handleRecoveryPassword = async (data: { email: string }) => {
    setRecoveryLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const respuesta = await peticionRecuperarPassword(data.email);
      
      if (respuesta.error) {
        setError(respuesta.message);
      } else {
        setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico.");
        resetRecuperar();
        // Opcional: cerrar el modal después de 3 segundos
        setTimeout(() => {
          setShowRecovery(false);
          setSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error en recuperación:", error);
      setError("Error al enviar el correo de recuperación. Intenta nuevamente.");
    } finally {
      setRecoveryLoading(false);
    }
  };*/

  const handleLogout = () => {
    // Cerrar sesión manualmente
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("tokenTimestamp");
    localStorage.removeItem("tokenExpiry");
    router.push("/login");
  };

  return (
    <div className="login-container">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>

      <div className="logo-container">
        <Image 
          src="/logo.jpeg" 
          alt="Logo de la empresa" 
          width={400} 
          height={200}
          className="logo"
          priority
          style={{ cursor: 'pointer' }}
          onClick={() => window.location.href = '/'}
        />
      </div>

      <div className="login-card">
        {!showRecovery ? (
          <>
            <h1 className="login-title">Iniciar Sesión</h1>
            
            {error && (
              <div className="error-message">
                <FiAlertCircle /> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Usuario</label>
                <div style={{ position: 'relative' }}>
                  <FiUser className="input-icon" />
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    {...register("username")}
                    required
                    disabled={loginLoading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <FiLock className="input-icon" />
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    {...register("password")}
                    required
                    disabled={loginLoading}
                  />
                </div>
              </div>
              
              <div className="forgot-password">
                <button 
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setShowRecovery(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              
              <div className="button-group">
                <button 
                  className="login-button" 
                  type="submit"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <><FiLogIn /> Iniciar Sesión</>
                  )}
                </button>
                
                <button 
                  className="register-button" 
                  onClick={() => router.push("/registro")}
                  type="button"
                  disabled={loginLoading}
                >
                  <FiUserPlus /> Registrarse
                </button>
              </div>
            </form>
            
            {/* Información de roles */}
            <div className="roles-info">
              <p className="roles-title">Acceso por rol:</p>
              <div className="role-badge admin-role">
                👑 Administrador - Acceso total al sistema
              </div>
              <div className="role-badge user-role">
                👤 Usuario - Acceso a funciones básicas
              </div>
            </div>
          </>
        ) : (
          <>
            <button 
              className="back-button"
              onClick={() => {
                setShowRecovery(false);
                setError(null);
                setSuccess(null);
              }}
            >
              <FiArrowLeft /> Volver al inicio de sesión
            </button>
            
            <h1 className="login-title">Recuperar Contraseña</h1>
            
            {error && (
              <div className="error-message">
                <FiAlertCircle /> {error}
              </div>
            )}
            
            {success && (
              <div className="success-message">
                <FiKey /> {success}
              </div>
            )}
            
            {/*<form onSubmit={handleSubmitRecuperar(handleRecoveryPassword)}>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <FiMail className="input-icon" />
                  <input
                    className="form-input"
                    type="email"
                    placeholder="tu@email.com"
                    {...registerRecuperar("email")}
                    required
                    disabled={recoveryLoading}
                  />
                </div>
              </div>
              
              <div className="button-group">
                <button 
                  className="login-button" 
                  type="submit"
                  disabled={recoveryLoading}
                >
                  {recoveryLoading ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <><FiKey /> Enviar enlace de recuperación</>
                  )}
                </button>
              </div>
            </form>*/}
          </>
        )}|
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }

        .logo-container {
          margin-bottom: 30px;
          animation: fadeIn 0.8s ease-out;
        }

        .logo {
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .login-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.6s ease-out;
        }

        .login-title {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
          font-size: 28px;
          font-weight: 600;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          border-left: 4px solid #c33;
          animation: shake 0.3s ease-out;
        }

        .success-message {
          background: #efe;
          color: #3c3;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          border-left: 4px solid #3c3;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          font-size: 18px;
        }

        .forgot-password {
          text-align: right;
          margin-bottom: 20px;
        }

        .forgot-password-link {
          background: none;
          border: none;
          color: #667eea;
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.3s;
        }

        .forgot-password-link:hover {
          color: #764ba2;
        }

        .button-group {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .login-button, .register-button, .back-button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
        }

        .login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .register-button {
          background: #f0f0f0;
          color: #666;
        }

        .register-button:hover:not(:disabled) {
          background: #e0e0e0;
          transform: translateY(-2px);
        }

        .back-button {
          background: #f0f0f0;
          color: #666;
          margin-bottom: 20px;
          width: 100%;
        }

        .back-button:hover {
          background: #e0e0e0;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .roles-info {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .roles-title {
          font-size: 12px;
          color: #999;
          margin-bottom: 10px;
          text-align: center;
        }

        .role-badge {
          padding: 8px;
          margin-bottom: 8px;
          border-radius: 8px;
          font-size: 12px;
          text-align: center;
        }

        .admin-role {
          background: #f0f0ff;
          color: #667eea;
          border-left: 3px solid #667eea;
        }

        .user-role {
          background: #f0fff0;
          color: #3c3;
          border-left: 3px solid #3c3;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
          }
          
          .button-group {
            flex-direction: column;
          }
          
          .logo {
            width: 300px;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
}