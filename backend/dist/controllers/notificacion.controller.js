"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarNotificaciones = listarNotificaciones;
exports.obtenerResumenNotificaciones = obtenerResumenNotificaciones;
exports.marcarNotificacionLeida = marcarNotificacionLeida;
exports.marcarTodasLeidas = marcarTodasLeidas;
const notificacion_service_js_1 = require("../services/notificacion.service.js");
function obtenerUsuarioId(request) {
    const usuarioId = Number(request.usuario?.usuarioId);
    if (!Number.isInteger(usuarioId) ||
        usuarioId <= 0) {
        throw new Error("No se pudo identificar al usuario");
    }
    return usuarioId;
}
function obtenerNotificacionId(request) {
    const notificacionId = Number(request.params.notificacionId);
    if (!Number.isInteger(notificacionId) ||
        notificacionId <= 0) {
        throw new Error("El identificador de la notificación no es válido");
    }
    return notificacionId;
}
function obtenerCodigoEstado(mensaje) {
    if (mensaje.includes("No se pudo identificar")) {
        return 401;
    }
    if (mensaje.includes("no pertenece al usuario")) {
        return 404;
    }
    if (mensaje.includes("no es válido")) {
        return 400;
    }
    return 500;
}
async function listarNotificaciones(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const notificaciones = await (0, notificacion_service_js_1.obtenerNotificaciones)(usuarioId);
        response.status(200).json({
            ok: true,
            notificaciones,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron obtener las notificaciones";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al listar notificaciones:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function obtenerResumenNotificaciones(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const noLeidas = await (0, notificacion_service_js_1.contarNotificacionesNoLeidas)(usuarioId);
        response.status(200).json({
            ok: true,
            noLeidas,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo obtener el resumen de notificaciones";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al obtener resumen de notificaciones:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function marcarNotificacionLeida(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const notificacionId = obtenerNotificacionId(request);
        await (0, notificacion_service_js_1.marcarNotificacionComoLeida)(notificacionId, usuarioId);
        response.status(200).json({
            ok: true,
            message: "Notificación marcada como leída",
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo actualizar la notificación";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al marcar notificación:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function marcarTodasLeidas(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const actualizadas = await (0, notificacion_service_js_1.marcarTodasLasNotificacionesComoLeidas)(usuarioId);
        response.status(200).json({
            ok: true,
            message: "Notificaciones marcadas como leídas",
            actualizadas,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron actualizar las notificaciones";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al marcar todas las notificaciones:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
