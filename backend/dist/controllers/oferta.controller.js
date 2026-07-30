"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarOferta = registrarOferta;
exports.listarOfertasRealizadas = listarOfertasRealizadas;
exports.listarOfertasRecibidas = listarOfertasRecibidas;
exports.actualizarEstadoOferta = actualizarEstadoOferta;
exports.registrarContraoferta = registrarContraoferta;
exports.responderContraofertaRecibida = responderContraofertaRecibida;
const oferta_service_js_1 = require("../services/oferta.service.js");
function obtenerUsuarioId(request) {
    const usuarioId = Number(request.usuario?.usuarioId);
    if (!Number.isInteger(usuarioId) ||
        usuarioId <= 0) {
        throw new Error("No se pudo identificar al usuario");
    }
    return usuarioId;
}
function obtenerOfertaId(request) {
    const ofertaId = Number(request.params.ofertaId);
    if (!Number.isInteger(ofertaId) ||
        ofertaId <= 0) {
        throw new Error("El identificador de la oferta no es válido");
    }
    return ofertaId;
}
function obtenerArticuloId(request) {
    const articuloId = Number(request.body.articuloId);
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
    if (mensaje.includes("No tienes permiso")) {
        return 403;
    }
    if (mensaje.includes("no existe")) {
        return 404;
    }
    if (mensaje.includes("Ya tienes una oferta")) {
        return 409;
    }
    if (mensaje.includes("no es válido") ||
        mensaje.includes("debe ser mayor") ||
        mensaje.includes("demasiado alto") ||
        mensaje.includes("propia publicación") ||
        mensaje.includes("no está disponible") ||
        mensaje.includes("superar los 500") ||
        mensaje.includes("ya fue respondida") ||
        mensaje.includes("Solo puedes contraofertar") ||
        mensaje.includes("no tiene una contraoferta")) {
        return 400;
    }
    return 500;
}
async function registrarOferta(request, response) {
    try {
        const compradorId = obtenerUsuarioId(request);
        const articuloId = obtenerArticuloId(request);
        const precioOfertado = Number(request.body.precioOfertado);
        const resultado = await (0, oferta_service_js_1.crearOferta)(compradorId, articuloId, precioOfertado, request.body.mensaje);
        response.status(201).json({
            ok: true,
            message: "Oferta registrada correctamente",
            oferta: resultado,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo registrar la oferta";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al registrar oferta:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function listarOfertasRealizadas(request, response) {
    try {
        const compradorId = obtenerUsuarioId(request);
        const ofertas = await (0, oferta_service_js_1.obtenerOfertasRealizadas)(compradorId);
        response.status(200).json({
            ok: true,
            ofertas,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron obtener las ofertas realizadas";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al listar ofertas realizadas:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function listarOfertasRecibidas(request, response) {
    try {
        const vendedorId = obtenerUsuarioId(request);
        const ofertas = await (0, oferta_service_js_1.obtenerOfertasRecibidas)(vendedorId);
        response.status(200).json({
            ok: true,
            ofertas,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron obtener las ofertas recibidas";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al listar ofertas recibidas:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function actualizarEstadoOferta(request, response) {
    try {
        const vendedorId = obtenerUsuarioId(request);
        const ofertaId = obtenerOfertaId(request);
        const estado = request.body.estado;
        await (0, oferta_service_js_1.responderOferta)(ofertaId, vendedorId, estado);
        response.status(200).json({
            ok: true,
            message: estado === "aceptada"
                ? "Oferta aceptada correctamente"
                : "Oferta rechazada correctamente",
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo responder la oferta";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al responder oferta:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function registrarContraoferta(request, response) {
    try {
        const vendedorId = obtenerUsuarioId(request);
        const ofertaId = obtenerOfertaId(request);
        const precioContraoferta = Number(request.body
            .precioContraoferta);
        await (0, oferta_service_js_1.crearContraoferta)(ofertaId, vendedorId, precioContraoferta, request.body
            .mensajeContraoferta);
        response.status(200).json({
            ok: true,
            message: "Contraoferta enviada correctamente",
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo registrar la contraoferta";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al registrar contraoferta:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function responderContraofertaRecibida(request, response) {
    try {
        const compradorId = obtenerUsuarioId(request);
        const ofertaId = obtenerOfertaId(request);
        const aceptar = request.body.aceptar;
        await (0, oferta_service_js_1.responderContraoferta)(ofertaId, compradorId, aceptar);
        response.status(200).json({
            ok: true,
            message: aceptar
                ? "Contraoferta aceptada correctamente"
                : "Contraoferta rechazada correctamente",
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo responder la contraoferta";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al responder contraoferta:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
