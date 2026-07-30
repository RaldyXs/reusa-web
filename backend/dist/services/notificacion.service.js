"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearNotificacion = crearNotificacion;
exports.obtenerNotificaciones = obtenerNotificaciones;
exports.contarNotificacionesNoLeidas = contarNotificacionesNoLeidas;
exports.marcarNotificacionComoLeida = marcarNotificacionComoLeida;
exports.marcarTodasLasNotificacionesComoLeidas = marcarTodasLasNotificacionesComoLeidas;
const notificacion_repository_js_1 = require("../repositories/notificacion.repository.js");
function validarIdentificador(valor, nombre) {
    if (!Number.isInteger(valor) ||
        valor <= 0) {
        throw new Error(`El identificador de ${nombre} no es válido`);
    }
}
function limpiarTexto(valor, nombre, maximo) {
    if (typeof valor !== "string") {
        throw new Error(`${nombre} no es válido`);
    }
    const texto = valor.trim();
    if (!texto) {
        throw new Error(`${nombre} es obligatorio`);
    }
    if (texto.length > maximo) {
        throw new Error(`${nombre} no puede superar los ${maximo} caracteres`);
    }
    return texto;
}
function limpiarEnlace(enlace) {
    if (enlace === undefined ||
        enlace === null) {
        return null;
    }
    if (typeof enlace !== "string") {
        throw new Error("El enlace de la notificación no es válido");
    }
    const enlaceLimpio = enlace.trim();
    if (!enlaceLimpio) {
        return null;
    }
    if (enlaceLimpio.length > 300) {
        throw new Error("El enlace de la notificación no puede superar los 300 caracteres");
    }
    return enlaceLimpio;
}
async function crearNotificacion(datos) {
    validarIdentificador(datos.usuarioId, "usuario");
    const titulo = limpiarTexto(datos.titulo, "El título", 150);
    const mensaje = limpiarTexto(datos.mensaje, "El mensaje", 500);
    const enlace = limpiarEnlace(datos.enlace);
    const notificacionId = await (0, notificacion_repository_js_1.crearNotificacionEnBaseDeDatos)({
        usuarioId: datos.usuarioId,
        tipo: datos.tipo,
        titulo,
        mensaje,
        enlace,
    });
    if (!Number.isInteger(notificacionId) ||
        notificacionId <= 0) {
        throw new Error("No se pudo crear la notificación");
    }
    return notificacionId;
}
async function obtenerNotificaciones(usuarioId) {
    validarIdentificador(usuarioId, "usuario");
    return (0, notificacion_repository_js_1.obtenerNotificacionesDesdeBaseDeDatos)(usuarioId);
}
async function contarNotificacionesNoLeidas(usuarioId) {
    validarIdentificador(usuarioId, "usuario");
    return (0, notificacion_repository_js_1.contarNotificacionesNoLeidasEnBaseDeDatos)(usuarioId);
}
async function marcarNotificacionComoLeida(notificacionId, usuarioId) {
    validarIdentificador(notificacionId, "notificación");
    validarIdentificador(usuarioId, "usuario");
    const actualizada = await (0, notificacion_repository_js_1.marcarNotificacionComoLeidaEnBaseDeDatos)(notificacionId, usuarioId);
    if (!actualizada) {
        throw new Error("La notificación indicada no existe o no pertenece al usuario");
    }
}
async function marcarTodasLasNotificacionesComoLeidas(usuarioId) {
    validarIdentificador(usuarioId, "usuario");
    return (0, notificacion_repository_js_1.marcarTodasLasNotificacionesComoLeidasEnBaseDeDatos)(usuarioId);
}
