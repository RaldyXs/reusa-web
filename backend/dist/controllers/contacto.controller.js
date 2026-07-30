"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerContacto = obtenerContacto;
const contacto_service_js_1 = require("../services/contacto.service.js");
function obtenerUsuarioId(request) {
    const usuarioId = Number(request.usuario?.usuarioId);
    if (!Number.isInteger(usuarioId) ||
        usuarioId <= 0) {
        throw new Error("No se pudo identificar al usuario");
    }
    return usuarioId;
}
function obtenerArticuloId(request) {
    const articuloId = Number(request.params.articuloId);
    if (!Number.isInteger(articuloId) ||
        articuloId <= 0) {
        throw new Error("El identificador del artículo no es válido");
    }
    return articuloId;
}
function obtenerCodigoEstado(mensaje) {
    if (mensaje.includes("No se pudo identificar")) {
        return 401;
    }
    if (mensaje.includes("no existe")) {
        return 404;
    }
    if (mensaje.includes("tus propios datos")) {
        return 403;
    }
    if (mensaje.includes("no es válido")) {
        return 400;
    }
    return 500;
}
async function obtenerContacto(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const articuloId = obtenerArticuloId(request);
        const contacto = await (0, contacto_service_js_1.obtenerContactoVendedor)(usuarioId, articuloId);
        response.status(200).json({
            ok: true,
            contacto,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo obtener el contacto del vendedor";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al obtener contacto del vendedor:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
