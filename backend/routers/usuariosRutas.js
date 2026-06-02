import { Router } from "express";
import { register, login } from "../db/usuariosBD.js";
import User from "../models/usuarioModelo.js";
import { mensajes } from "../libs/manejoErrores.js";
import { usuarioAutorizado, adminAutorizado } from "../middlewares/funcionesPassword.js";
const router = Router();

//Inicio de sesión
router.post("/ingresar", async (req, res) => {
    const respuesta = await login(req.body);
    
    if (respuesta.status === 200) {
        res.cookie("token", respuesta.data.token).status(200).json({
            status: 200,
            message: "Inicio de sesión exitoso",
            token: respuesta.data.token,
            usuario: {
                id: respuesta.data.usuario?.id,
                username: respuesta.data.usuario?.username,
                email: respuesta.data.usuario?.email,
                tipoUsuario: respuesta.data.usuario?.tipoUsuario // Asegurar que siempre viene aquí
            }
        });
    } else {
        res.status(respuesta.status).json({
            status: respuesta.status,
            message: respuesta.message,
            error: respuesta.error
        });
    }
});

//Registro del usuario
router.post("/registro", async (req, res) => {
    const respuesta = await register(req.body);
    if (respuesta.status === 200) {
        res.cookie('token', respuesta.token).status(respuesta.status).json(respuesta);
    } else {
        res.status(respuesta.status).json(respuesta);
    }
});

router.get("/salir", async(req, res)=>{
    res.cookie('token','',{expires:new Date(0)}).clearCookie('token').status(200).json("Cerraste sesion correctamente");
});

// Obtener todos los usuarios desde la base de datos
router.get("/usuarios", async (req, res) => {
    //const respuesta = usuarioAutorizado(req.cookies.token, req);
    try {
        const usuarios = await User.find(); // Buscar todos los usuarios
        console.log("Usuarios obtenidos:", usuarios);
        res.status(200).json({ usuarios, mensaje: "Lista de usuarios" });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json(mensajes(500, "Error al obtener usuarios", error));
    }
});

//Borrar el usuario por id
router.delete("/usuarios/:id", async (req, res) => {
    try {
        const usuario = await User.findByIdAndDelete(req.params.id);
        if (!usuario) return res.status(404).json(mensajes(404, "Usuario no encontrado"));
        res.status(200).json(mensajes(200, "Usuario borrado correctamente"));
    } catch (error) {
        res.status(500).json(mensajes(500, "Error al borrar el usuario", error));
    }
});

//Actualiza el  usuario por ID
router.put("/usuarios/:id", async (req, res) => {
    try {
        const usuario = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!usuario) return res.status(404).json(mensajes(404, "Usuario no encontrado"));
        res.status(200).json({ mensaje: "Usuario actualizado correctamente", usuario });
    } catch (error) {
        res.status(500).json(mensajes(500, "Error al actualizar el usuario", error));
    }
});

export default router; 