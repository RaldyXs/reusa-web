"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarSesion = iniciarSesion;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_js_1 = require("../repositories/auth.repository.js");
function obtenerJwtSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("La variable JWT_SECRET no está configurada");
    }
    return jwtSecret;
}
async function iniciarSesion(datos) {
    const email = typeof datos.email === "string"
        ? datos.email.trim().toLowerCase()
        : "";
    const contrasena = typeof datos.contrasena === "string"
        ? datos.contrasena
        : "";
    if (!email || !contrasena) {
        throw new Error("El correo y la contraseña son obligatorios");
    }
    const usuario = await (0, auth_repository_js_1.buscarUsuarioPorEmail)(email);
    if (!usuario) {
        throw new Error("Correo o contraseña incorrectos");
    }
    if (Number(usuario.activo) !== 1) {
        throw new Error("Esta cuenta se encuentra desactivada");
    }
    const contrasenaCorrecta = await bcryptjs_1.default.compare(contrasena, usuario.contrasena);
    if (!contrasenaCorrecta) {
        throw new Error("Correo o contraseña incorrectos");
    }
    const usuarioSesion = {
        usuarioId: Number(usuario.usuario_id),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
    };
    const payload = {
        usuarioId: usuarioSesion.usuarioId,
        email: usuarioSesion.email,
        rol: usuarioSesion.rol,
    };
    const token = jsonwebtoken_1.default.sign(payload, obtenerJwtSecret(), {
        expiresIn: "8h",
    });
    return {
        token,
        usuario: usuarioSesion,
    };
}
