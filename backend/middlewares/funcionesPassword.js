import crypto from "crypto";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { mensajes } from "../libs/manejoErrores.js";
import { buscaUsuarioPorID } from "../db/usuariosBD.js";

export function encriptarPassword(password){
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto.scryptSync(password, salt, 10, 64, "sha512").toString("hex");
    return{
        salt,
        hash
    }
}

export function validarPassword(password, salt, hash){
    const hashEvaluar = crypto.scryptSync(password, salt, 10, 64, "sha512").toString("hex");
    return hashEvaluar ==  hash;
}

//Crear token con tipoUsuario incluido
export function crearToken(payload) {
    //Si no trae tipoUsuario, se pone como "usuario" por defecto
    const tipo = payload.tipoUsuario || "usuario";

    return jwt.sign(
        { ...payload, tipoUsuario: tipo },
        process.env.SECRET_TOKEN,
        { expiresIn: "1h" }
    );
}

// 🔐 Verificar token y agregar req.usuario
export async function usuarioAutorizado(token, req) {
    if (!token) {
        return mensajes(400, "Usuario no autorizado - token ausente");
    }

    try {
        const usuario = jwt.verify(token, process.env.SECRET_TOKEN);
        req.usuario = usuario;

        // Si el token no trae tipoUsuario, buscarlo desde la base de datos
        if (!usuario.tipoUsuario) {
            const usuarioBD = await buscaUsuarioPorID(usuario.id);
            if (!usuarioBD) return mensajes(400, "Usuario no encontrado");
            req.usuario.tipoUsuario = usuarioBD.tipoUsuario;
        }

        return mensajes(200, "Usuario autorizado");
    } catch (error) {
        return mensajes(400, "Usuario no autorizado - token no válido", error);
    }
}

// 🔐 Solo para administradores
export async function adminAutorizado(req) {
    const respuesta = await usuarioAutorizado(req.cookies.token, req);
    if (respuesta.status !== 200) {
        return mensajes(400, "Admin no autorizado");
    }

    const usuario = await buscaUsuarioPorID(req.usuario.id);
    if (!usuario || usuario.tipoUsuario !== "admin") {
        return mensajes(400, "Admin no autorizado");
    }

    return mensajes(200, "Admin autorizado");
}