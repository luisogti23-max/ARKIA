import User from "../models/usuarioModelo.js";
import { mensajes } from "../libs/manejoErrores.js";
import {crearToken} from "../libs/jwt.js";
import {encriptarPassword, validarPassword} from "../middlewares/funcionesPassword.js";

export async function register ({username, email, password}){
    try {
        const usuarioExistente = await User.findOne({username});
        const emailExistente = await User.findOne({email});
        if (usuarioExistente || emailExistente){
            return mensajes(400,"usuario duplicado");
        }
        const {hash, salt} = encriptarPassword(password);
        const data = new User({username,email,password:hash, salt});
        var respuesta = await data.save();
        const token=await crearToken(
            {
                id:respuesta._id,
                username:respuesta.username,
                email:respuesta.email,
                tipoUsuario:respuesta.tipoUsuario
            });
        return mensajes(200,respuesta.tipoUsuario,"",token);
    } catch (error) {
        return mensajes(400,"Error al registrar al usuario",error);
    }
}

export const login = async({username, password}) => {    
    try {
        const usuarioCorrecto = await User.findOne({username}); // ← Ahora User está definido
        
        if (!usuarioCorrecto) {
            return mensajes(400, "Datos incorrectos: usuario");
        }

        const passwordCorrecto = validarPassword(password, usuarioCorrecto.salt, usuarioCorrecto.password);
        
        if (!passwordCorrecto) {
            return mensajes(400, "Datos incorrectos: contraseña");
        }

        const token = await crearToken({
            id: usuarioCorrecto._id, 
            username: usuarioCorrecto.username, 
            email: usuarioCorrecto.email, 
            tipoUsuario: usuarioCorrecto.tipoUsuario
        });

        return {
            status: 200,
            message: "Ingreso correcto",
            data: {
                token: token,
                usuario: {
                    id: usuarioCorrecto._id,
                    username: usuarioCorrecto.username,
                    email: usuarioCorrecto.email,
                    tipoUsuario: usuarioCorrecto.tipoUsuario
                }
            }
        };

    } catch (error) {
        return {
            status: 400,
            message: "Error en el login",
            error: error.message
        };
    }
};

export const buscaUsuarioPorID = async(id)=>{
    const respuesta = await User.findById(id);
    return respuesta
    
}
