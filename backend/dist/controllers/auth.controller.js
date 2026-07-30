"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.registrar = registrar;
const auth_service_js_1 = require("../services/auth.service.js");
function obtenerMensajeError(error) {
    return error instanceof Error
        ? error.message
        : "Ocurrió un error desconocido";
}
async function login(request, response) {
    try {
        const resultado = await (0, auth_service_js_1.iniciarSesion)(request.body);
        response.status(200).json({
            ok: true,
            message: "Sesión iniciada correctamente",
            token: resultado.token,
            usuario: resultado.usuario,
        });
    }
    catch (error) {
        response.status(401).json({
            ok: false,
            message: obtenerMensajeError(error),
        });
    }
}
async function registrar(request, response) {
    try {
        const resultado = await (0, auth_service_js_1.registrarUsuario)(request.body);
        response.status(201).json({
            ok: true,
            message: "Usuario registrado correctamente",
            usuario: resultado.usuario,
        });
    }
    catch (error) {
        const mensaje = obtenerMensajeError(error);
        const estadoHttp = mensaje ===
            "Ya existe un usuario registrado con ese correo"
            ? 409
            : 400;
        response.status(estadoHttp).json({
            ok: false,
            message: mensaje,
        });
    }
}
