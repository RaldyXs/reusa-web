"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerResumenAdministracion = obtenerResumenAdministracion;
exports.obtenerEstadisticasDashboardAdministracion = obtenerEstadisticasDashboardAdministracion;
exports.obtenerUsuariosAdministracion = obtenerUsuariosAdministracion;
exports.cambiarEstadoUsuarioAdministracion = cambiarEstadoUsuarioAdministracion;
exports.obtenerPublicacionesAdministracion = obtenerPublicacionesAdministracion;
exports.obtenerOfertasAdministracion = obtenerOfertasAdministracion;
exports.cambiarEstadoPublicacionAdministracion = cambiarEstadoPublicacionAdministracion;
exports.obtenerCategoriasAdministracion = obtenerCategoriasAdministracion;
exports.crearCategoriaAdministracion = crearCategoriaAdministracion;
exports.actualizarCategoriaAdministracion = actualizarCategoriaAdministracion;
exports.cambiarEstadoCategoriaAdministracion = cambiarEstadoCategoriaAdministracion;
const admin_repository_js_1 = require("../repositories/admin.repository.js");
function normalizarNombreCategoria(valor) {
    return typeof valor === "string"
        ? valor.trim()
        : "";
}
function normalizarDescripcionCategoria(valor) {
    if (typeof valor !== "string") {
        return null;
    }
    const descripcion = valor.trim();
    return descripcion || null;
}
function validarCategoria(datos) {
    const nombre = normalizarNombreCategoria(datos.nombre);
    const descripcion = normalizarDescripcionCategoria(datos.descripcion);
    if (nombre.length < 2) {
        throw new Error("El nombre de la categoría debe tener al menos 2 caracteres");
    }
    if (nombre.length > 100) {
        throw new Error("El nombre de la categoría no puede superar los 100 caracteres");
    }
    if (descripcion &&
        descripcion.length > 500) {
        throw new Error("La descripción no puede superar los 500 caracteres");
    }
    return {
        nombre,
        descripcion,
    };
}
async function obtenerResumenAdministracion() {
    return (0, admin_repository_js_1.obtenerResumenAdministracionDesdeBaseDeDatos)();
}
async function obtenerEstadisticasDashboardAdministracion() {
    const [usuariosPorMes, publicacionesPorMes, publicacionesPorEstado, publicacionesPorCategoria,] = await Promise.all([
        (0, admin_repository_js_1.obtenerUsuariosPorMesDesdeBaseDeDatos)(),
        (0, admin_repository_js_1.obtenerPublicacionesPorMesDesdeBaseDeDatos)(),
        (0, admin_repository_js_1.obtenerPublicacionesPorEstadoDesdeBaseDeDatos)(),
        (0, admin_repository_js_1.obtenerPublicacionesPorCategoriaDesdeBaseDeDatos)(),
    ]);
    return {
        usuarios_por_mes: usuariosPorMes,
        publicaciones_por_mes: publicacionesPorMes,
        publicaciones_por_estado: publicacionesPorEstado,
        publicaciones_por_categoria: publicacionesPorCategoria,
    };
}
async function obtenerUsuariosAdministracion() {
    return (0, admin_repository_js_1.obtenerUsuariosAdministracionDesdeBaseDeDatos)();
}
async function cambiarEstadoUsuarioAdministracion(usuarioId, activo, administradorId) {
    if (!Number.isInteger(usuarioId) ||
        usuarioId <= 0) {
        throw new Error("El identificador del usuario no es válido");
    }
    if (!Number.isInteger(administradorId) ||
        administradorId <= 0) {
        throw new Error("No se pudo identificar al administrador");
    }
    if (typeof activo !== "boolean") {
        throw new Error("El estado del usuario no es válido");
    }
    const usuario = await (0, admin_repository_js_1.obtenerUsuarioAdministracionPorIdDesdeBaseDeDatos)(usuarioId);
    if (!usuario) {
        throw new Error("El usuario indicado no existe");
    }
    if (usuarioId === administradorId &&
        !activo) {
        throw new Error("No puedes desactivar tu propia cuenta");
    }
    const estadoActual = Number(usuario.activo) === 1;
    if (estadoActual === activo) {
        return usuario;
    }
    const actualizado = await (0, admin_repository_js_1.actualizarEstadoUsuarioDesdeBaseDeDatos)(usuarioId, activo);
    if (!actualizado) {
        throw new Error("No se pudo actualizar el estado del usuario");
    }
    const usuarioActualizado = await (0, admin_repository_js_1.obtenerUsuarioAdministracionPorIdDesdeBaseDeDatos)(usuarioId);
    if (!usuarioActualizado) {
        throw new Error("El usuario fue actualizado, pero no pudo recuperarse");
    }
    return usuarioActualizado;
}
async function obtenerPublicacionesAdministracion() {
    return (0, admin_repository_js_1.obtenerPublicacionesAdministracionDesdeBaseDeDatos)();
}
async function obtenerOfertasAdministracion() {
    return (0, admin_repository_js_1.obtenerOfertasAdministracionDesdeBaseDeDatos)();
}
async function cambiarEstadoPublicacionAdministracion(articuloId, estado) {
    if (!Number.isInteger(articuloId) ||
        articuloId <= 0) {
        throw new Error("El identificador de la publicación no es válido");
    }
    const estadosPermitidos = [
        "activo",
        "vendido",
        "archivado",
    ];
    if (!estadosPermitidos.includes(estado)) {
        throw new Error("El estado de la publicación no es válido");
    }
    const publicacion = await (0, admin_repository_js_1.obtenerPublicacionAdministracionPorIdDesdeBaseDeDatos)(articuloId);
    if (!publicacion) {
        throw new Error("La publicación indicada no existe");
    }
    const yaTieneEseEstado = publicacion.estado === estado &&
        Number(publicacion.archivado) ===
            (estado === "archivado"
                ? 1
                : 0);
    if (yaTieneEseEstado) {
        return publicacion;
    }
    const actualizada = await (0, admin_repository_js_1.actualizarEstadoPublicacionDesdeBaseDeDatos)(articuloId, estado);
    if (!actualizada) {
        throw new Error("No se pudo actualizar el estado de la publicación");
    }
    const publicacionActualizada = await (0, admin_repository_js_1.obtenerPublicacionAdministracionPorIdDesdeBaseDeDatos)(articuloId);
    if (!publicacionActualizada) {
        throw new Error("La publicación fue actualizada, pero no pudo recuperarse");
    }
    return publicacionActualizada;
}
async function obtenerCategoriasAdministracion() {
    return (0, admin_repository_js_1.obtenerCategoriasAdministracionDesdeBaseDeDatos)();
}
async function crearCategoriaAdministracion(datos) {
    const categoriaValidada = validarCategoria(datos);
    const categoriaExistente = await (0, admin_repository_js_1.obtenerCategoriaAdministracionPorNombreDesdeBaseDeDatos)(categoriaValidada.nombre);
    if (categoriaExistente) {
        throw new Error("Ya existe una categoría con ese nombre");
    }
    const categoriaId = await (0, admin_repository_js_1.crearCategoriaAdministracionDesdeBaseDeDatos)(categoriaValidada);
    if (!Number.isInteger(categoriaId) ||
        categoriaId <= 0) {
        throw new Error("No se pudo crear la categoría");
    }
    const categoriaCreada = await (0, admin_repository_js_1.obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos)(categoriaId);
    if (!categoriaCreada) {
        throw new Error("La categoría fue creada, pero no pudo recuperarse");
    }
    return categoriaCreada;
}
async function actualizarCategoriaAdministracion(categoriaId, datos) {
    if (!Number.isInteger(categoriaId) ||
        categoriaId <= 0) {
        throw new Error("El identificador de la categoría no es válido");
    }
    const categoriaActual = await (0, admin_repository_js_1.obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos)(categoriaId);
    if (!categoriaActual) {
        throw new Error("La categoría indicada no existe");
    }
    const categoriaValidada = validarCategoria(datos);
    const categoriaDuplicada = await (0, admin_repository_js_1.obtenerCategoriaAdministracionPorNombreDesdeBaseDeDatos)(categoriaValidada.nombre, categoriaId);
    if (categoriaDuplicada) {
        throw new Error("Ya existe otra categoría con ese nombre");
    }
    const mismosDatos = categoriaActual.nombre ===
        categoriaValidada.nombre &&
        (categoriaActual.descripcion ??
            null) ===
            categoriaValidada.descripcion;
    if (mismosDatos) {
        return categoriaActual;
    }
    const actualizada = await (0, admin_repository_js_1.actualizarCategoriaAdministracionDesdeBaseDeDatos)(categoriaId, categoriaValidada);
    if (!actualizada) {
        throw new Error("No se pudo actualizar la categoría");
    }
    const categoriaActualizada = await (0, admin_repository_js_1.obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos)(categoriaId);
    if (!categoriaActualizada) {
        throw new Error("La categoría fue actualizada, pero no pudo recuperarse");
    }
    return categoriaActualizada;
}
async function cambiarEstadoCategoriaAdministracion(categoriaId, activo) {
    if (!Number.isInteger(categoriaId) ||
        categoriaId <= 0) {
        throw new Error("El identificador de la categoría no es válido");
    }
    if (typeof activo !== "boolean") {
        throw new Error("El estado de la categoría no es válido");
    }
    const categoria = await (0, admin_repository_js_1.obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos)(categoriaId);
    if (!categoria) {
        throw new Error("La categoría indicada no existe");
    }
    const estadoActual = Number(categoria.activo) === 1;
    if (estadoActual === activo) {
        return categoria;
    }
    const actualizada = await (0, admin_repository_js_1.actualizarEstadoCategoriaAdministracionDesdeBaseDeDatos)(categoriaId, activo);
    if (!actualizada) {
        throw new Error("No se pudo actualizar el estado de la categoría");
    }
    const categoriaActualizada = await (0, admin_repository_js_1.obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos)(categoriaId);
    if (!categoriaActualizada) {
        throw new Error("La categoría fue actualizada, pero no pudo recuperarse");
    }
    return categoriaActualizada;
}
