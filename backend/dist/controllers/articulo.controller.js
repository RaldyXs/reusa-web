"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerArticulos = obtenerArticulos;
exports.obtenerMisPublicaciones = obtenerMisPublicaciones;
exports.obtenerArticulo = obtenerArticulo;
exports.publicarArticulo = publicarArticulo;
exports.editarArticulo = editarArticulo;
exports.cambiarEstadoArticulo = cambiarEstadoArticulo;
exports.cambiarArchivadoArticulo = cambiarArchivadoArticulo;
exports.guardarImagenesArticulo = guardarImagenesArticulo;
exports.eliminarImagenArticulo = eliminarImagenArticulo;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const articulo_service_js_1 = require("../services/articulo.service.js");
const articulo_repository_js_1 = require("../repositories/articulo.repository.js");
function obtenerMensajeError(error) {
    return error instanceof Error
        ? error.message
        : "Ocurrió un error desconocido";
}
function convertirArticuloId(valor) {
    const articuloId = Number(valor);
    if (!Number.isInteger(articuloId) ||
        articuloId < 1) {
        throw new Error("El identificador del artículo no es válido");
    }
    return articuloId;
}
function usuarioPuedeGestionarArticulo(request, vendedorId) {
    if (!request.usuario) {
        return false;
    }
    if (request.usuario.rol === "administrador") {
        return true;
    }
    return (Number(request.usuario.usuarioId) ===
        Number(vendedorId));
}
async function eliminarArchivos(archivos) {
    await Promise.allSettled(archivos.map((archivo) => promises_1.default.unlink(archivo.path)));
}
async function eliminarArchivoDesdeUrl(urlImagen) {
    try {
        const url = new URL(urlImagen);
        const nombreArchivo = node_path_1.default.basename(url.pathname);
        const rutaArchivo = node_path_1.default.resolve(process.cwd(), "uploads", "articulos", nombreArchivo);
        await promises_1.default.unlink(rutaArchivo);
    }
    catch (error) {
        const codigo = typeof error === "object" &&
            error !== null &&
            "code" in error
            ? String(error.code)
            : "";
        if (codigo !== "ENOENT") {
            console.error("No se pudo eliminar el archivo de imagen:", error);
        }
    }
}
async function obtenerArticulos(request, response) {
    try {
        const termino = typeof request.query.termino === "string"
            ? request.query.termino
            : undefined;
        const categoriaId = typeof request.query.categoriaId === "string"
            ? request.query.categoriaId
            : undefined;
        const articulos = await (0, articulo_service_js_1.buscarArticulos)(termino, categoriaId);
        response.status(200).json({
            ok: true,
            total: articulos.length,
            articulos,
        });
    }
    catch (error) {
        response.status(400).json({
            ok: false,
            message: obtenerMensajeError(error),
        });
    }
}
async function obtenerMisPublicaciones(request, response) {
    try {
        if (!request.usuario) {
            response.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para ver tus publicaciones",
            });
            return;
        }
        const articulos = await (0, articulo_service_js_1.obtenerMisArticulos)(request.usuario.usuarioId);
        response.status(200).json({
            ok: true,
            total: articulos.length,
            articulos,
        });
    }
    catch (error) {
        response.status(400).json({
            ok: false,
            message: obtenerMensajeError(error),
        });
    }
}
async function obtenerArticulo(request, response) {
    try {
        const id = typeof request.params.id === "string"
            ? request.params.id
            : undefined;
        if (!id) {
            response.status(400).json({
                ok: false,
                message: "ID de artículo inválido",
            });
            return;
        }
        const articulo = await (0, articulo_service_js_1.obtenerArticuloPorId)(id);
        if (!articulo) {
            response.status(404).json({
                ok: false,
                message: "El artículo solicitado no existe",
            });
            return;
        }
        response.status(200).json({
            ok: true,
            articulo,
        });
    }
    catch (error) {
        response.status(400).json({
            ok: false,
            message: obtenerMensajeError(error),
        });
    }
}
async function publicarArticulo(request, response) {
    try {
        if (!request.usuario) {
            response.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para publicar",
            });
            return;
        }
        const articulo = await (0, articulo_service_js_1.crearArticulo)({
            ...request.body,
            vendedorId: request.usuario.usuarioId,
        });
        response.status(201).json({
            ok: true,
            message: "Artículo publicado correctamente",
            articulo,
        });
    }
    catch (error) {
        response.status(400).json({
            ok: false,
            message: obtenerMensajeError(error),
        });
    }
}
async function editarArticulo(request, response) {
    try {
        if (!request.usuario) {
            response.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para editar",
            });
            return;
        }
        const id = typeof request.params.id === "string"
            ? request.params.id
            : undefined;
        const articuloId = convertirArticuloId(id);
        const articuloExistente = await (0, articulo_service_js_1.obtenerArticuloPorId)(String(articuloId));
        if (!articuloExistente) {
            response.status(404).json({
                ok: false,
                message: "El artículo no existe",
            });
            return;
        }
        if (!usuarioPuedeGestionarArticulo(request, articuloExistente.vendedor_id)) {
            response.status(403).json({
                ok: false,
                message: "No tienes permiso para editar esta publicación",
            });
            return;
        }
        const articuloActualizado = await (0, articulo_service_js_1.actualizarArticulo)(String(articuloId), request.body);
        response.status(200).json({
            ok: true,
            message: "Artículo actualizado correctamente",
            articulo: articuloActualizado,
        });
    }
    catch (error) {
        const mensaje = obtenerMensajeError(error);
        const estadoHttp = mensaje === "El artículo no existe"
            ? 404
            : 400;
        response.status(estadoHttp).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function cambiarEstadoArticulo(request, response) {
    try {
        if (!request.usuario) {
            response.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para cambiar el estado",
            });
            return;
        }
        const id = typeof request.params.id === "string"
            ? request.params.id
            : undefined;
        const articuloId = convertirArticuloId(id);
        const articuloExistente = await (0, articulo_service_js_1.obtenerArticuloPorId)(String(articuloId));
        if (!articuloExistente) {
            response.status(404).json({
                ok: false,
                message: "El artículo no existe",
            });
            return;
        }
        if (!usuarioPuedeGestionarArticulo(request, articuloExistente.vendedor_id)) {
            response.status(403).json({
                ok: false,
                message: "No tienes permiso para cambiar el estado de esta publicación",
            });
            return;
        }
        const articuloActualizado = await (0, articulo_service_js_1.actualizarEstadoArticulo)(String(articuloId), request.body);
        response.status(200).json({
            ok: true,
            message: "Estado actualizado correctamente",
            articulo: articuloActualizado,
        });
    }
    catch (error) {
        const mensaje = obtenerMensajeError(error);
        const estadoHttp = mensaje === "El artículo no existe"
            ? 404
            : 400;
        response.status(estadoHttp).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function cambiarArchivadoArticulo(request, response) {
    try {
        if (!request.usuario) {
            response.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para archivar publicaciones",
            });
            return;
        }
        const id = typeof request.params.id === "string"
            ? request.params.id
            : undefined;
        const articuloId = convertirArticuloId(id);
        const articuloExistente = await (0, articulo_service_js_1.obtenerArticuloPorId)(String(articuloId));
        if (!articuloExistente) {
            response.status(404).json({
                ok: false,
                message: "El artículo no existe",
            });
            return;
        }
        if (!usuarioPuedeGestionarArticulo(request, articuloExistente.vendedor_id)) {
            response.status(403).json({
                ok: false,
                message: "No tienes permiso para archivar esta publicación",
            });
            return;
        }
        const articuloActualizado = await (0, articulo_service_js_1.actualizarArchivadoArticulo)(String(articuloId), request.body);
        const estaArchivado = Number(articuloActualizado.archivado) === 1;
        response.status(200).json({
            ok: true,
            message: estaArchivado
                ? "Publicación archivada correctamente"
                : "Publicación desarchivada correctamente",
            articulo: articuloActualizado,
        });
    }
    catch (error) {
        const mensaje = obtenerMensajeError(error);
        const estadoHttp = mensaje === "El artículo no existe"
            ? 404
            : 400;
        response.status(estadoHttp).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function guardarImagenesArticulo(request, response) {
    const archivos = request.files ??
        [];
    try {
        if (!request.usuario) {
            await eliminarArchivos(archivos);
            response.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para subir imágenes",
            });
            return;
        }
        const id = typeof request.params.id === "string"
            ? request.params.id
            : undefined;
        const articuloId = convertirArticuloId(id);
        const articuloExistente = await (0, articulo_service_js_1.obtenerArticuloPorId)(String(articuloId));
        if (!articuloExistente) {
            await eliminarArchivos(archivos);
            response.status(404).json({
                ok: false,
                message: "El artículo no existe",
            });
            return;
        }
        if (!usuarioPuedeGestionarArticulo(request, articuloExistente.vendedor_id)) {
            await eliminarArchivos(archivos);
            response.status(403).json({
                ok: false,
                message: "No tienes permiso para agregar imágenes a esta publicación",
            });
            return;
        }
        if (archivos.length === 0) {
            response.status(400).json({
                ok: false,
                message: "Debes seleccionar al menos una imagen",
            });
            return;
        }
        const cantidadActual = await (0, articulo_repository_js_1.contarImagenesArticulo)(articuloId);
        if (cantidadActual + archivos.length >
            5) {
            await eliminarArchivos(archivos);
            response.status(400).json({
                ok: false,
                message: "El artículo no puede tener más de cinco imágenes",
            });
            return;
        }
        const baseUrl = `${request.protocol}://${request.get("host")}`;
        const imagenes = archivos.map((archivo, indice) => ({
            urlImagen: `${baseUrl}/uploads/articulos/${archivo.filename}`,
            esPrincipal: cantidadActual === 0 &&
                indice === 0,
            orden: cantidadActual + indice,
        }));
        await (0, articulo_repository_js_1.guardarImagenesArticuloEnBaseDeDatos)(articuloId, imagenes);
        const articuloActualizado = await (0, articulo_service_js_1.obtenerArticuloPorId)(String(articuloId));
        response.status(201).json({
            ok: true,
            message: "Imágenes guardadas correctamente",
            imagenes: imagenes.map((imagen) => imagen.urlImagen),
            articulo: articuloActualizado,
        });
    }
    catch (error) {
        await eliminarArchivos(archivos);
        response.status(400).json({
            ok: false,
            message: obtenerMensajeError(error),
        });
    }
}
async function eliminarImagenArticulo(request, response) {
    try {
        if (!request.usuario) {
            response.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para eliminar imágenes",
            });
            return;
        }
        const id = typeof request.params.id === "string"
            ? request.params.id
            : undefined;
        const articuloId = convertirArticuloId(id);
        const urlImagen = typeof request.body.urlImagen === "string"
            ? request.body.urlImagen.trim()
            : "";
        if (!urlImagen) {
            response.status(400).json({
                ok: false,
                message: "Debes indicar la imagen que deseas eliminar",
            });
            return;
        }
        const articuloExistente = await (0, articulo_service_js_1.obtenerArticuloPorId)(String(articuloId));
        if (!articuloExistente) {
            response.status(404).json({
                ok: false,
                message: "El artículo no existe",
            });
            return;
        }
        if (!usuarioPuedeGestionarArticulo(request, articuloExistente.vendedor_id)) {
            response.status(403).json({
                ok: false,
                message: "No tienes permiso para eliminar imágenes de esta publicación",
            });
            return;
        }
        const eliminada = await (0, articulo_repository_js_1.eliminarImagenArticuloEnBaseDeDatos)(articuloId, urlImagen);
        if (!eliminada) {
            response.status(404).json({
                ok: false,
                message: "La imagen indicada no pertenece al artículo",
            });
            return;
        }
        await eliminarArchivoDesdeUrl(urlImagen);
        const articuloActualizado = await (0, articulo_service_js_1.obtenerArticuloPorId)(String(articuloId));
        response.status(200).json({
            ok: true,
            message: "Imagen eliminada correctamente",
            articulo: articuloActualizado,
        });
    }
    catch (error) {
        response.status(400).json({
            ok: false,
            message: obtenerMensajeError(error),
        });
    }
}
