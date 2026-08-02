"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPerfil = obtenerPerfil;
exports.actualizarPerfil = actualizarPerfil;
exports.cambiarContrasena = cambiarContrasena;
const cuenta_service_js_1 = require("../services/cuenta.service.js");
function obtenerUsuarioId(request) {
    const usuarioId = Number(request.usuario?.usuarioId);
    if (!Number.isInteger(usuarioId) ||
        usuarioId <= 0) {
        throw new Error("No se pudo identificar al usuario");
    }
    return usuarioId;
}
function obtenerMostrarContacto(valor) {
    if (typeof valor === "boolean") {
        return valor;
    }
    if (valor === 1 ||
        valor === "1" ||
        valor === "true") {
        return true;
    }
    if (valor === 0 ||
        valor === "0" ||
        valor === "false") {
        return false;
    }
    throw new Error("La preferencia de contacto no es válida");
}
function obtenerCodigoEstado(mensaje) {
    if (mensaje.includes("No se pudo identificar")) {
        return 401;
    }
    if (mensaje.includes("no existe")) {
        return 404;
    }
    if (mensaje.includes("contraseña actual no es correcta")) {
        return 401;
    }
    if (mensaje.includes("no es válido") ||
        mensaje.includes("no es válida") ||
        mensaje.includes("es obligatorio") ||
        mensaje.includes("no puede superar") ||
        mensaje.includes("debe tener al menos") ||
        mensaje.includes("debe ser diferente") ||
        mensaje.includes("no coinciden") ||
        mensaje.includes("demasiado larga")) {
        return 400;
    }
    return 500;
}
async function obtenerPerfil(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const perfil = await (0, cuenta_service_js_1.obtenerPerfilUsuario)(usuarioId);
        response.status(200).json({
            ok: true,
            perfil,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo obtener el perfil";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al obtener perfil:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function actualizarPerfil(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const mostrarContacto = obtenerMostrarContacto(request.body.mostrarContacto);
        const perfil = await (0, cuenta_service_js_1.actualizarPerfilUsuario)(usuarioId, request.body.nombre, request.body.apellido, request.body.telefono, request.body.ubicacion, mostrarContacto);
        response.status(200).json({
            ok: true,
            message: "Perfil actualizado correctamente",
            perfil,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo actualizar el perfil";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al actualizar perfil:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function cambiarContrasena(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        await (0, cuenta_service_js_1.cambiarContrasenaUsuario)(usuarioId, request.body.contrasenaActual, request.body.nuevaContrasena, request.body.confirmarContrasena);
        response.status(200).json({
            ok: true,
            message: "Contraseña actualizada correctamente",
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo actualizar la contraseña";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al cambiar contraseña:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
