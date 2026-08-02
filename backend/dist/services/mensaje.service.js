"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearOObtenerConversacion = crearOObtenerConversacion;
exports.obtenerConversaciones = obtenerConversaciones;
exports.obtenerMensajes = obtenerMensajes;
exports.enviarMensaje = enviarMensaje;
exports.editarMensaje = editarMensaje;
exports.eliminarMensaje = eliminarMensaje;
const mensaje_repository_js_1 = require("../repositories/mensaje.repository.js");
const articulo_repository_js_1 = require("../repositories/articulo.repository.js");
const notificacion_service_js_1 = require("./notificacion.service.js");
function validarIdentificador(valor, nombre) {
    if (!Number.isInteger(valor) ||
        valor <= 0) {
        throw new Error(`El identificador de ${nombre} no es válido`);
    }
}
function limpiarContenido(contenido) {
    if (typeof contenido !== "string") {
        throw new Error("El contenido del mensaje no es válido");
    }
    const contenidoLimpio = contenido.trim();
    if (!contenidoLimpio) {
        throw new Error("El mensaje no puede estar vacío");
    }
    if (contenidoLimpio.length > 1000) {
        throw new Error("El mensaje no puede superar los 1000 caracteres");
    }
    return contenidoLimpio;
}
function limpiarContenidoOpcional(contenido) {
    if (contenido === undefined ||
        contenido === null) {
        return "";
    }
    if (typeof contenido !== "string") {
        throw new Error("El contenido del mensaje no es válido");
    }
    const contenidoLimpio = contenido.trim();
    if (contenidoLimpio.length > 1000) {
        throw new Error("El mensaje no puede superar los 1000 caracteres");
    }
    return contenidoLimpio;
}
function validarTipoMensaje(tipo) {
    if (tipo === undefined ||
        tipo === null ||
        tipo === "") {
        return "texto";
    }
    if (tipo !== "texto" &&
        tipo !== "imagen") {
        throw new Error("El tipo de mensaje no es válido");
    }
    return tipo;
}
function limpiarUrlImagen(urlImagen) {
    if (urlImagen === undefined ||
        urlImagen === null ||
        urlImagen === "") {
        return null;
    }
    if (typeof urlImagen !== "string") {
        throw new Error("La imagen del mensaje no es válida");
    }
    const urlLimpia = urlImagen.trim();
    if (!urlLimpia) {
        return null;
    }
    if (urlLimpia.length > 500) {
        throw new Error("La dirección de la imagen es demasiado larga");
    }
    const esRutaLocal = urlLimpia.startsWith("/uploads/");
    const esUrlHttp = urlLimpia.startsWith("http://") ||
        urlLimpia.startsWith("https://");
    if (!esRutaLocal &&
        !esUrlHttp) {
        throw new Error("La dirección de la imagen no es válida");
    }
    return urlLimpia;
}
function usuarioPerteneceAConversacion(usuarioId, conversacion) {
    return (Number(conversacion.comprador_id) === usuarioId ||
        Number(conversacion.vendedor_id) === usuarioId);
}
function obtenerDestinatarioId(remitenteId, conversacion) {
    return Number(conversacion.comprador_id) === remitenteId
        ? Number(conversacion.vendedor_id)
        : Number(conversacion.comprador_id);
}
function crearResumenNotificacion(tipo, contenido) {
    if (tipo === "imagen") {
        if (!contenido) {
            return "Te envió una imagen";
        }
        return contenido.length > 120
            ? `Imagen: ${contenido.slice(0, 109)}...`
            : `Imagen: ${contenido}`;
    }
    return contenido.length > 120
        ? `${contenido.slice(0, 117)}...`
        : contenido;
}
async function crearOObtenerConversacion(articuloId, compradorId) {
    validarIdentificador(articuloId, "artículo");
    validarIdentificador(compradorId, "comprador");
    const articulo = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(articuloId);
    if (!articulo) {
        throw new Error("El artículo indicado no existe");
    }
    const vendedorId = Number(articulo.vendedor_id);
    validarIdentificador(vendedorId, "vendedor");
    if (vendedorId === compradorId) {
        throw new Error("No puedes iniciar una conversación contigo mismo");
    }
    if (Number(articulo.eliminado ?? 0) === 1) {
        throw new Error("El artículo fue eliminado");
    }
    const conversacionExistente = await (0, mensaje_repository_js_1.buscarConversacionExistenteEnBaseDeDatos)(articuloId, compradorId, vendedorId);
    if (conversacionExistente) {
        return {
            conversacionId: conversacionExistente,
        };
    }
    const conversacionId = await (0, mensaje_repository_js_1.crearConversacionEnBaseDeDatos)({
        articuloId,
        compradorId,
        vendedorId,
    });
    if (!Number.isInteger(conversacionId) ||
        conversacionId <= 0) {
        throw new Error("No se pudo crear la conversación");
    }
    return {
        conversacionId,
    };
}
async function obtenerConversaciones(usuarioId) {
    validarIdentificador(usuarioId, "usuario");
    return (0, mensaje_repository_js_1.obtenerConversacionesDeUsuarioEnBaseDeDatos)(usuarioId);
}
async function obtenerMensajes(conversacionId, usuarioId) {
    validarIdentificador(conversacionId, "conversación");
    validarIdentificador(usuarioId, "usuario");
    const conversacion = await (0, mensaje_repository_js_1.obtenerConversacionPorIdEnBaseDeDatos)(conversacionId);
    if (!conversacion) {
        throw new Error("La conversación indicada no existe");
    }
    if (!usuarioPerteneceAConversacion(usuarioId, conversacion)) {
        throw new Error("No tienes permiso para ver esta conversación");
    }
    await (0, mensaje_repository_js_1.marcarMensajesComoLeidosEnBaseDeDatos)(conversacionId, usuarioId);
    return (0, mensaje_repository_js_1.obtenerMensajesDeConversacionEnBaseDeDatos)(conversacionId);
}
async function enviarMensaje(conversacionId, remitenteId, contenido, tipoMensaje = "texto", urlImagen = null) {
    validarIdentificador(conversacionId, "conversación");
    validarIdentificador(remitenteId, "remitente");
    const tipo = validarTipoMensaje(tipoMensaje);
    const imagenLimpia = limpiarUrlImagen(urlImagen);
    let contenidoLimpio = "";
    if (tipo === "texto") {
        contenidoLimpio =
            limpiarContenido(contenido);
        if (imagenLimpia) {
            throw new Error("Un mensaje de texto no puede contener una imagen");
        }
    }
    else {
        contenidoLimpio =
            limpiarContenidoOpcional(contenido);
        if (!imagenLimpia) {
            throw new Error("Debes seleccionar una imagen");
        }
    }
    const conversacion = await (0, mensaje_repository_js_1.obtenerConversacionPorIdEnBaseDeDatos)(conversacionId);
    if (!conversacion) {
        throw new Error("La conversación indicada no existe");
    }
    if (!usuarioPerteneceAConversacion(remitenteId, conversacion)) {
        throw new Error("No tienes permiso para enviar mensajes en esta conversación");
    }
    const mensajeId = await (0, mensaje_repository_js_1.crearMensajeEnBaseDeDatos)({
        conversacionId,
        remitenteId,
        contenido: contenidoLimpio,
        tipo,
        urlImagen: imagenLimpia,
    });
    if (!Number.isInteger(mensajeId) ||
        mensajeId <= 0) {
        throw new Error("No se pudo enviar el mensaje");
    }
    const destinatarioId = obtenerDestinatarioId(remitenteId, conversacion);
    try {
        await (0, notificacion_service_js_1.crearNotificacion)({
            usuarioId: destinatarioId,
            tipo: "mensaje_nuevo",
            titulo: "Nuevo mensaje",
            mensaje: crearResumenNotificacion(tipo, contenidoLimpio),
            enlace: `/mensajes?conversacion=${conversacionId}`,
        });
    }
    catch (error) {
        console.error("No se pudo crear la notificación del mensaje:", error);
    }
    return {
        mensajeId,
    };
}
async function editarMensaje(mensajeId, usuarioId, contenido) {
    validarIdentificador(mensajeId, "mensaje");
    validarIdentificador(usuarioId, "usuario");
    const contenidoLimpio = limpiarContenido(contenido);
    const mensaje = await (0, mensaje_repository_js_1.obtenerMensajePorIdEnBaseDeDatos)(mensajeId);
    if (!mensaje) {
        throw new Error("El mensaje indicado no existe");
    }
    if (Number(mensaje.remitente_id) !== usuarioId) {
        throw new Error("No tienes permiso para editar este mensaje");
    }
    if (Number(mensaje.eliminado) === 1) {
        throw new Error("No puedes editar un mensaje eliminado");
    }
    if (mensaje.tipo !== "texto") {
        throw new Error("Solo se pueden editar mensajes de texto");
    }
    if (mensaje.contenido.trim() ===
        contenidoLimpio) {
        throw new Error("El nuevo contenido debe ser diferente");
    }
    const actualizado = await (0, mensaje_repository_js_1.actualizarMensajeEnBaseDeDatos)(mensajeId, usuarioId, contenidoLimpio);
    if (!actualizado) {
        throw new Error("No se pudo editar el mensaje");
    }
}
async function eliminarMensaje(mensajeId, usuarioId) {
    validarIdentificador(mensajeId, "mensaje");
    validarIdentificador(usuarioId, "usuario");
    const mensaje = await (0, mensaje_repository_js_1.obtenerMensajePorIdEnBaseDeDatos)(mensajeId);
    if (!mensaje) {
        throw new Error("El mensaje indicado no existe");
    }
    if (Number(mensaje.remitente_id) !== usuarioId) {
        throw new Error("No tienes permiso para eliminar este mensaje");
    }
    if (Number(mensaje.eliminado) === 1) {
        throw new Error("El mensaje ya fue eliminado");
    }
    const eliminado = await (0, mensaje_repository_js_1.eliminarMensajeEnBaseDeDatos)(mensajeId, usuarioId);
    if (!eliminado) {
        throw new Error("No se pudo eliminar el mensaje");
    }
}
