"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearOferta = crearOferta;
exports.obtenerOfertasRealizadas = obtenerOfertasRealizadas;
exports.obtenerOfertasRecibidas = obtenerOfertasRecibidas;
exports.responderOferta = responderOferta;
exports.crearContraoferta = crearContraoferta;
exports.responderContraoferta = responderContraoferta;
const oferta_repository_js_1 = require("../repositories/oferta.repository.js");
const articulo_repository_js_1 = require("../repositories/articulo.repository.js");
const notificacion_service_js_1 = require("./notificacion.service.js");
function validarIdentificador(valor, nombre) {
    if (!Number.isInteger(valor) ||
        valor <= 0) {
        throw new Error(`El identificador de ${nombre} no es válido`);
    }
}
function validarPrecio(precio, nombre = "El precio ofertado") {
    if (!Number.isFinite(precio) ||
        precio <= 0) {
        throw new Error(`${nombre} debe ser mayor que cero`);
    }
    if (precio > 9999999999.99) {
        throw new Error(`${nombre} es demasiado alto`);
    }
}
function limpiarMensaje(mensaje, nombre = "El mensaje") {
    if (mensaje === undefined ||
        mensaje === null) {
        return null;
    }
    if (typeof mensaje !== "string") {
        throw new Error(`${nombre} no es válido`);
    }
    const mensajeLimpio = mensaje.trim();
    if (!mensajeLimpio) {
        return null;
    }
    if (mensajeLimpio.length > 500) {
        throw new Error(`${nombre} no puede superar los 500 caracteres`);
    }
    return mensajeLimpio;
}
async function crearNotificacionSegura(datos) {
    try {
        await (0, notificacion_service_js_1.crearNotificacion)(datos);
    }
    catch (error) {
        console.error("No se pudo crear la notificación:", error);
    }
}
async function crearOferta(compradorId, articuloId, precioOfertado, mensaje) {
    validarIdentificador(compradorId, "comprador");
    validarIdentificador(articuloId, "artículo");
    validarPrecio(precioOfertado);
    const mensajeLimpio = limpiarMensaje(mensaje);
    const articulo = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(articuloId);
    if (!articulo) {
        throw new Error("El artículo indicado no existe");
    }
    const vendedorId = Number(articulo.vendedor_id);
    if (vendedorId === compradorId) {
        throw new Error("No puedes hacer una oferta por tu propia publicación");
    }
    if (articulo.estado !== "activo" ||
        Number(articulo.archivado) === 1) {
        throw new Error("El artículo no está disponible para recibir ofertas");
    }
    const ofertaPendiente = await (0, oferta_repository_js_1.buscarOfertaPendienteEnBaseDeDatos)(compradorId, articuloId);
    if (ofertaPendiente) {
        throw new Error("Ya tienes una oferta activa para este artículo");
    }
    const ofertaId = await (0, oferta_repository_js_1.crearOfertaEnBaseDeDatos)({
        compradorId,
        articuloId,
        precioOfertado,
        mensaje: mensajeLimpio,
    });
    if (!Number.isInteger(ofertaId) ||
        ofertaId <= 0) {
        throw new Error("No se pudo registrar la oferta");
    }
    await crearNotificacionSegura({
        usuarioId: vendedorId,
        tipo: "oferta_recibida",
        titulo: "Nueva oferta recibida",
        mensaje: `Recibiste una oferta de RD$${precioOfertado.toLocaleString("es-DO")} por "${articulo.titulo}".`,
        enlace: "/historial-ventas",
    });
    return {
        ofertaId,
    };
}
async function obtenerOfertasRealizadas(compradorId) {
    validarIdentificador(compradorId, "comprador");
    return (0, oferta_repository_js_1.obtenerOfertasRealizadasDesdeBaseDeDatos)(compradorId);
}
async function obtenerOfertasRecibidas(vendedorId) {
    validarIdentificador(vendedorId, "vendedor");
    return (0, oferta_repository_js_1.obtenerOfertasRecibidasDesdeBaseDeDatos)(vendedorId);
}
async function responderOferta(ofertaId, vendedorId, estado) {
    validarIdentificador(ofertaId, "oferta");
    validarIdentificador(vendedorId, "vendedor");
    if (estado !== "aceptada" &&
        estado !== "rechazada") {
        throw new Error("El estado de la oferta no es válido");
    }
    const oferta = await (0, oferta_repository_js_1.obtenerOfertaPorIdDesdeBaseDeDatos)(ofertaId);
    if (!oferta) {
        throw new Error("La oferta indicada no existe");
    }
    if (Number(oferta.vendedor_id) !== vendedorId) {
        throw new Error("No tienes permiso para responder esta oferta");
    }
    if (oferta.estado !==
        "pendiente") {
        throw new Error("La oferta ya fue respondida");
    }
    const actualizada = await (0, oferta_repository_js_1.actualizarEstadoOfertaEnBaseDeDatos)(ofertaId, vendedorId, estado);
    if (!actualizada) {
        throw new Error("No se pudo actualizar la oferta");
    }
    await crearNotificacionSegura({
        usuarioId: Number(oferta.comprador_id),
        tipo: estado === "aceptada"
            ? "oferta_aceptada"
            : "oferta_rechazada",
        titulo: estado === "aceptada"
            ? "Oferta aceptada"
            : "Oferta rechazada",
        mensaje: estado === "aceptada"
            ? "El vendedor aceptó tu oferta."
            : "El vendedor rechazó tu oferta.",
        enlace: "/historial-compras",
    });
    if (estado === "aceptada") {
        await crearNotificacionSegura({
            usuarioId: vendedorId,
            tipo: "articulo_vendido",
            titulo: "Artículo vendido",
            mensaje: "Una oferta fue aceptada y el artículo fue marcado como vendido.",
            enlace: "/historial-ventas",
        });
    }
}
async function crearContraoferta(ofertaId, vendedorId, precioContraoferta, mensajeContraoferta) {
    validarIdentificador(ofertaId, "oferta");
    validarIdentificador(vendedorId, "vendedor");
    validarPrecio(precioContraoferta, "El precio de la contraoferta");
    const mensajeLimpio = limpiarMensaje(mensajeContraoferta, "El mensaje de la contraoferta");
    const oferta = await (0, oferta_repository_js_1.obtenerOfertaPorIdDesdeBaseDeDatos)(ofertaId);
    if (!oferta) {
        throw new Error("La oferta indicada no existe");
    }
    if (Number(oferta.vendedor_id) !== vendedorId) {
        throw new Error("No tienes permiso para enviar una contraoferta");
    }
    if (oferta.estado !==
        "pendiente") {
        throw new Error("Solo puedes contraofertar una oferta pendiente");
    }
    const actualizada = await (0, oferta_repository_js_1.crearContraofertaEnBaseDeDatos)({
        ofertaId,
        vendedorId,
        precioContraoferta,
        mensajeContraoferta: mensajeLimpio,
    });
    if (!actualizada) {
        throw new Error("No se pudo registrar la contraoferta");
    }
    await crearNotificacionSegura({
        usuarioId: Number(oferta.comprador_id),
        tipo: "contraoferta_recibida",
        titulo: "Contraoferta recibida",
        mensaje: `El vendedor propuso RD$${precioContraoferta.toLocaleString("es-DO")}.`,
        enlace: "/historial-compras",
    });
}
async function responderContraoferta(ofertaId, compradorId, aceptar) {
    validarIdentificador(ofertaId, "oferta");
    validarIdentificador(compradorId, "comprador");
    if (typeof aceptar !==
        "boolean") {
        throw new Error("La respuesta de la contraoferta no es válida");
    }
    const oferta = await (0, oferta_repository_js_1.obtenerOfertaPorIdDesdeBaseDeDatos)(ofertaId);
    if (!oferta) {
        throw new Error("La oferta indicada no existe");
    }
    if (Number(oferta.comprador_id) !== compradorId) {
        throw new Error("No tienes permiso para responder esta contraoferta");
    }
    if (oferta.estado !==
        "contraoferta") {
        throw new Error("La oferta no tiene una contraoferta pendiente");
    }
    const actualizada = await (0, oferta_repository_js_1.responderContraofertaEnBaseDeDatos)({
        ofertaId,
        compradorId,
        aceptar,
    });
    if (!actualizada) {
        throw new Error("No se pudo responder la contraoferta");
    }
    const vendedorId = Number(oferta.vendedor_id);
    await crearNotificacionSegura({
        usuarioId: vendedorId,
        tipo: aceptar
            ? "contraoferta_aceptada"
            : "contraoferta_rechazada",
        titulo: aceptar
            ? "Contraoferta aceptada"
            : "Contraoferta rechazada",
        mensaje: aceptar
            ? "El comprador aceptó tu contraoferta."
            : "El comprador rechazó tu contraoferta.",
        enlace: "/historial-ventas",
    });
    if (aceptar) {
        await crearNotificacionSegura({
            usuarioId: compradorId,
            tipo: "articulo_vendido",
            titulo: "Compra confirmada",
            mensaje: "Aceptaste la contraoferta y el artículo fue marcado como vendido.",
            enlace: "/historial-compras",
        });
        await crearNotificacionSegura({
            usuarioId: vendedorId,
            tipo: "articulo_vendido",
            titulo: "Artículo vendido",
            mensaje: "El comprador aceptó tu contraoferta y el artículo fue marcado como vendido.",
            enlace: "/historial-ventas",
        });
    }
}
