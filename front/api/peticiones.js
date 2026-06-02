import axios from 'axios';
const API = "http://localhost:3001/api";

//petocion de login
export const peticionLogin = async (credenciales) => {
    console.log("Credenciales enviadas:", credenciales);
    
    try {

        const response = await axios.post(`${API}/ingresar`, credenciales, {
            withCredentials: true
        });

        console.log("Respuesta completa del servidor:", response.data);
        
        if (!response.data.usuario || !response.data.usuario.tipoUsuario) {
            throw new Error("Estructura de respuesta inválida: falta tipoUsuario");
        }
        
        return {
            data: {
                token: response.data.token,
                usuario: {
                    tipoUsuario: response.data.usuario.tipoUsuario
                }
            }
        };
    } catch (error) {
        //console.error("Error en login:", error.response?.data || error.message);
        //throw error;
        //console.log("Error en login:", error.response?.data || error.message); // log más discreto
        //return { error: true, data: error.response?.data || null, message: error.message };
        console.log("Error en login:", error.response?.data || error.message);
        
        // Si es un error 400 (Bad Request), asumimos que son credenciales incorrectas
        if (error.response?.status === 400) {
            return { 
                error: true, 
                message: "Datos incorrectos" 
            };
        }
        
        // Para otros errores, devolvemos el mensaje genérico
        return { 
            error: true, 
            message: error.message || "Error al iniciar sesión" 
        };
    }
};

//peticion de registro
export const peticionRegistro = async (usuario) => {
    console.log("estas en la funcion peticionRegistro");
    console.log(usuario);
    return await axios.post(`${API}/registro`, usuario);
}

// 🔵 OBTENER VILLAS
export const obtenerVillas = async () => {
    return await axios.get(`${API}/villas`);
};

