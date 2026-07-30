"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerFavoritos = obtenerFavoritos;
exports.obtenerIdsFavoritos = obtenerIdsFavoritos;
exports.guardarFavorito = guardarFavorito;
exports.quitarFavorito = quitarFavorito;
const favorito_service_js_1 = require("../services/favorito.service.js");
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
    if (mensaje.includes("no estaba guardado")) {
        return 404;
    }
    if (mensaje.includes("no es válido") ||
        mensaje.includes("publicación archivada")) {
        return 400;
    }
    return 500;
}
async function obtenerFavoritos(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const favoritos = await (0, favorito_service_js_1.obtenerFavoritosUsuario)(usuarioId);
        response.status(200).json({
            ok: true,
            favoritos,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron obtener los favoritos";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al obtener favoritos:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function obtenerIdsFavoritos(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const favoritos = await (0, favorito_service_js_1.obtenerIdsFavoritosUsuario)(usuarioId);
        response.status(200).json({
            ok: true,
            favoritos,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron obtener los favoritos";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al obtener IDs de favoritos:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function guardarFavorito(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const articuloId = obtenerArticuloId(request);
        const favorito = await (0, favorito_service_js_1.guardarArticuloFavorito)(usuarioId, articuloId);
        response.status(201).json({
            ok: true,
            message: "Artículo guardado correctamente",
            favorito,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo guardar el artículo";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al guardar favorito:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function quitarFavorito(request, response) {
    try {
        const usuarioId = obtenerUsuarioId(request);
        const articuloId = obtenerArticuloId(request);
        await (0, favorito_service_js_1.quitarArticuloFavorito)(usuarioId, articuloId);
        response.status(200).json({
            ok: true,
            message: "Artículo eliminado de guardados",
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo quitar el artículo";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al quitar favorito:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
