"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerFavoritosUsuario = obtenerFavoritosUsuario;
exports.obtenerIdsFavoritosUsuario = obtenerIdsFavoritosUsuario;
exports.guardarArticuloFavorito = guardarArticuloFavorito;
exports.quitarArticuloFavorito = quitarArticuloFavorito;
const favorito_repository_js_1 = require("../repositories/favorito.repository.js");
const articulo_repository_js_1 = require("../repositories/articulo.repository.js");
function validarIdentificador(valor, nombre) {
    if (!Number.isInteger(valor) ||
        valor <= 0) {
        throw new Error(`El identificador de ${nombre} no es válido`);
    }
}
async function obtenerFavoritosUsuario(usuarioId) {
    validarIdentificador(usuarioId, "usuario");
    return (0, favorito_repository_js_1.obtenerFavoritosPorUsuarioDesdeBaseDeDatos)(usuarioId);
}
async function obtenerIdsFavoritosUsuario(usuarioId) {
    validarIdentificador(usuarioId, "usuario");
    return (0, favorito_repository_js_1.obtenerIdsFavoritosPorUsuarioDesdeBaseDeDatos)(usuarioId);
}
async function guardarArticuloFavorito(usuarioId, articuloId) {
    validarIdentificador(usuarioId, "usuario");
    validarIdentificador(articuloId, "artículo");
    const articulo = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(articuloId);
    if (!articulo) {
        throw new Error("El artículo indicado no existe");
    }
    if (articulo.archivado === 1) {
        throw new Error("No puedes guardar una publicación archivada");
    }
    const favoritoExistente = await (0, favorito_repository_js_1.buscarFavoritoDesdeBaseDeDatos)(usuarioId, articuloId);
    if (favoritoExistente) {
        return {
            favoritoId: favoritoExistente,
            articuloId,
        };
    }
    const favoritoId = await (0, favorito_repository_js_1.crearFavoritoEnBaseDeDatos)(usuarioId, articuloId);
    if (!Number.isInteger(favoritoId) ||
        favoritoId <= 0) {
        throw new Error("No se pudo guardar el artículo");
    }
    return {
        favoritoId,
        articuloId,
    };
}
async function quitarArticuloFavorito(usuarioId, articuloId) {
    validarIdentificador(usuarioId, "usuario");
    validarIdentificador(articuloId, "artículo");
    const eliminado = await (0, favorito_repository_js_1.eliminarFavoritoDesdeBaseDeDatos)(usuarioId, articuloId);
    if (!eliminado) {
        throw new Error("El artículo no estaba guardado");
    }
}
