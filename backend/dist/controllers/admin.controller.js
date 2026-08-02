"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerResumenAdmin = obtenerResumenAdmin;
exports.obtenerEstadisticasDashboardAdmin = obtenerEstadisticasDashboardAdmin;
exports.obtenerUsuariosAdmin = obtenerUsuariosAdmin;
exports.cambiarEstadoUsuarioAdmin = cambiarEstadoUsuarioAdmin;
exports.obtenerPublicacionesAdmin = obtenerPublicacionesAdmin;
exports.obtenerOfertasAdmin = obtenerOfertasAdmin;
exports.cambiarEstadoPublicacionAdmin = cambiarEstadoPublicacionAdmin;
exports.obtenerCategoriasAdmin = obtenerCategoriasAdmin;
exports.crearCategoriaAdmin = crearCategoriaAdmin;
exports.actualizarCategoriaAdmin = actualizarCategoriaAdmin;
exports.cambiarEstadoCategoriaAdmin = cambiarEstadoCategoriaAdmin;
const admin_service_js_1 = require("../services/admin.service.js");
function obtenerCodigoEstado(mensaje) {
    if (mensaje.includes("no existe")) {
        return 404;
    }
    if (mensaje.includes("Ya existe")) {
        return 409;
    }
    if (mensaje.includes("No puedes desactivar tu propia cuenta")) {
        return 403;
    }
    if (mensaje.includes("no es válido") ||
        mensaje.includes("debe tener") ||
        mensaje.includes("no puede superar") ||
        mensaje.includes("Debes indicar") ||
        mensaje.includes("No se pudo identificar")) {
        return 400;
    }
    return 500;
}
async function obtenerResumenAdmin(_request, response) {
    try {
        const resumen = await (0, admin_service_js_1.obtenerResumenAdministracion)();
        response.status(200).json({
            ok: true,
            resumen,
        });
    }
    catch (errorDesconocido) {
        console.error("Error al obtener el resumen administrativo:", errorDesconocido);
        response.status(500).json({
            ok: false,
            message: "No se pudo obtener el resumen administrativo",
        });
    }
}
async function obtenerEstadisticasDashboardAdmin(_request, response) {
    try {
        const estadisticas = await (0, admin_service_js_1.obtenerEstadisticasDashboardAdministracion)();
        response.status(200).json({
            ok: true,
            estadisticas,
        });
    }
    catch (errorDesconocido) {
        console.error("Error al obtener las estadísticas administrativas:", errorDesconocido);
        response.status(500).json({
            ok: false,
            message: "No se pudieron obtener las estadísticas administrativas",
        });
    }
}
async function obtenerUsuariosAdmin(_request, response) {
    try {
        const usuarios = await (0, admin_service_js_1.obtenerUsuariosAdministracion)();
        response.status(200).json({
            ok: true,
            usuarios,
        });
    }
    catch (errorDesconocido) {
        console.error("Error al obtener los usuarios administrativos:", errorDesconocido);
        response.status(500).json({
            ok: false,
            message: "No se pudieron obtener los usuarios",
        });
    }
}
async function cambiarEstadoUsuarioAdmin(request, response) {
    try {
        const usuarioId = Number(request.params.usuarioId);
        const administradorId = Number(request.usuario?.usuarioId);
        const activo = request.body?.activo;
        if (!Number.isInteger(usuarioId) ||
            usuarioId <= 0) {
            response.status(400).json({
                ok: false,
                message: "El identificador del usuario no es válido",
            });
            return;
        }
        if (!Number.isInteger(administradorId) ||
            administradorId <= 0) {
            response.status(401).json({
                ok: false,
                message: "No se pudo identificar al administrador",
            });
            return;
        }
        if (typeof activo !== "boolean") {
            response.status(400).json({
                ok: false,
                message: "Debes indicar un estado válido",
            });
            return;
        }
        const usuario = await (0, admin_service_js_1.cambiarEstadoUsuarioAdministracion)(usuarioId, activo, administradorId);
        response.status(200).json({
            ok: true,
            message: activo
                ? "Usuario activado correctamente"
                : "Usuario desactivado correctamente",
            usuario,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo actualizar el usuario";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al cambiar el estado del usuario:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function obtenerPublicacionesAdmin(_request, response) {
    try {
        const publicaciones = await (0, admin_service_js_1.obtenerPublicacionesAdministracion)();
        response.status(200).json({
            ok: true,
            publicaciones,
        });
    }
    catch (errorDesconocido) {
        console.error("Error al obtener las publicaciones administrativas:", errorDesconocido);
        response.status(500).json({
            ok: false,
            message: "No se pudieron obtener las publicaciones",
        });
    }
}
async function obtenerOfertasAdmin(_request, response) {
    try {
        const ofertas = await (0, admin_service_js_1.obtenerOfertasAdministracion)();
        response.status(200).json({
            ok: true,
            ofertas,
        });
    }
    catch (errorDesconocido) {
        console.error("Error al obtener las ofertas administrativas:", errorDesconocido);
        response.status(500).json({
            ok: false,
            message: "No se pudieron obtener las ofertas",
        });
    }
}
async function cambiarEstadoPublicacionAdmin(request, response) {
    try {
        const articuloId = Number(request.params.articuloId);
        const estado = request.body?.estado;
        if (!Number.isInteger(articuloId) ||
            articuloId <= 0) {
            response.status(400).json({
                ok: false,
                message: "El identificador de la publicación no es válido",
            });
            return;
        }
        if (typeof estado !== "string") {
            response.status(400).json({
                ok: false,
                message: "Debes indicar un estado válido",
            });
            return;
        }
        const publicacion = await (0, admin_service_js_1.cambiarEstadoPublicacionAdministracion)(articuloId, estado);
        response.status(200).json({
            ok: true,
            message: estado === "activo"
                ? "Publicación activada correctamente"
                : estado === "vendido"
                    ? "Publicación marcada como vendida"
                    : "Publicación archivada correctamente",
            publicacion,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo actualizar la publicación";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al cambiar el estado de la publicación:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function obtenerCategoriasAdmin(_request, response) {
    try {
        const categorias = await (0, admin_service_js_1.obtenerCategoriasAdministracion)();
        response.status(200).json({
            ok: true,
            categorias,
        });
    }
    catch (errorDesconocido) {
        console.error("Error al obtener las categorías administrativas:", errorDesconocido);
        response.status(500).json({
            ok: false,
            message: "No se pudieron obtener las categorías",
        });
    }
}
async function crearCategoriaAdmin(request, response) {
    try {
        const categoria = await (0, admin_service_js_1.crearCategoriaAdministracion)({
            nombre: request.body?.nombre,
            descripcion: request.body?.descripcion,
        });
        response.status(201).json({
            ok: true,
            message: "Categoría creada correctamente",
            categoria,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo crear la categoría";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al crear la categoría:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function actualizarCategoriaAdmin(request, response) {
    try {
        const categoriaId = Number(request.params.categoriaId);
        if (!Number.isInteger(categoriaId) ||
            categoriaId <= 0) {
            response.status(400).json({
                ok: false,
                message: "El identificador de la categoría no es válido",
            });
            return;
        }
        const categoria = await (0, admin_service_js_1.actualizarCategoriaAdministracion)(categoriaId, {
            nombre: request.body?.nombre,
            descripcion: request.body?.descripcion,
        });
        response.status(200).json({
            ok: true,
            message: "Categoría actualizada correctamente",
            categoria,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo actualizar la categoría";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al actualizar la categoría:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
async function cambiarEstadoCategoriaAdmin(request, response) {
    try {
        const categoriaId = Number(request.params.categoriaId);
        const activo = request.body?.activo;
        if (!Number.isInteger(categoriaId) ||
            categoriaId <= 0) {
            response.status(400).json({
                ok: false,
                message: "El identificador de la categoría no es válido",
            });
            return;
        }
        if (typeof activo !== "boolean") {
            response.status(400).json({
                ok: false,
                message: "Debes indicar un estado válido",
            });
            return;
        }
        const categoria = await (0, admin_service_js_1.cambiarEstadoCategoriaAdministracion)(categoriaId, activo);
        response.status(200).json({
            ok: true,
            message: activo
                ? "Categoría activada correctamente"
                : "Categoría desactivada correctamente",
            categoria,
        });
    }
    catch (errorDesconocido) {
        const mensaje = errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo actualizar la categoría";
        const codigoEstado = obtenerCodigoEstado(mensaje);
        if (codigoEstado === 500) {
            console.error("Error al cambiar el estado de la categoría:", errorDesconocido);
        }
        response.status(codigoEstado).json({
            ok: false,
            message: mensaje,
        });
    }
}
