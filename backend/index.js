import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { conectarBD } from "./db/db.js";
import usuariosRutas from "./routers/usuariosRutas.js";
import villaRutas from "./routers/villasRutas.js";

const app = express();
conectarBD();
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Reemplaza con el origen de tu frontendÑ
    credentials: true // Para enviar cookies y headers de autenticación
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use("/api", usuariosRutas);
app.use("/api", villaRutas);


const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', ()=>{
    console.log(`Servidor en http://localhost:${PORT}`);
});