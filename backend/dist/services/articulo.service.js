"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarArticulos = buscarArticulos;
exports.obtenerMisArticulos = obtenerMisArticulos;
exports.obtenerArticuloPorId = obtenerArticuloPorId;
exports.crearArticulo = crearArticulo;
exports.actualizarArticulo = actualizarArticulo;
exports.actualizarEstadoArticulo = actualizarEstadoArticulo;
exports.actualizarArchivadoArticulo = actualizarArchivadoArticulo;
exports.eliminarArticulo = eliminarArticulo;
const articulo_repository_js_1 = require("../repositories/articulo.repository.js");
function convertirArticuloId(articuloId) {
    const idConvertido = Number(articuloId);
    if (!Number.isInteger(idConvertido) ||
        idConvertido < 1) {
        throw new Error("El identificador del artículo no es válido");
    }
    return idConvertido;
}
function convertirVendedorId(vendedorId) {
    const idConvertido = Number(vendedorId);
    if (!Number.isInteger(idConvertido) ||
        idConvertido < 1) {
        throw new Error("El identificador del vendedor no es válido");
    }
    return idConvertido;
}
function validarDatosArticulo(entrada) {
    const titulo = typeof entrada.titulo === "string"
        ? entrada.titulo.trim()
        : "";
    const descripcion = typeof entrada.descripcion === "string"
        ? entrada.descripcion.trim()
        : "";
    const ubicacion = typeof entrada.ubicacion === "string"
        ? entrada.ubicacion.trim()
        : "";
    const precio = Number(entrada.precio);
    const categoriaId = Number(entrada.categoriaId);
    const condicion = entrada.condicion;
    if (titulo.length < 3) {
        throw new Error("El título debe tener al menos 3 caracteres");
    }
    if (descripcion.length < 10) {
        throw new Error("La descripción debe tener al menos 10 caracteres");
    }
    if (!Number.isFinite(precio) ||
        precio <= 0) {
        throw new Error("El precio debe ser mayor que cero");
    }
    if (!Number.isInteger(categoriaId) ||
        categoriaId < 1) {
        throw new Error("La categoría seleccionada no es válida");
    }
    if (condicion !== "nuevo" &&
        condicion !== "usado" &&
        condicion !== "reparado") {
        throw new Error("La condición seleccionada no es válida");
    }
    if (!ubicacion) {
        throw new Error("La ubicación es obligatoria");
    }
    return {
        titulo,
        descripcion,
        precio,
        condicion,
        ubicacion,
        categoriaId,
    };
}
function verificarPropietario(articulo, vendedorId) {
    if (Number(articulo.vendedor_id) !== vendedorId) {
        throw new Error("No tienes permiso para modificar esta publicación");
    }
}
async function buscarArticulos(termino, categoriaId) {
    const terminoLimpio = termino?.trim() ?? "";
    let categoriaConvertida = null;
    if (categoriaId) {
        const numeroCategoria = Number(categoriaId);
        if (!Number.isInteger(numeroCategoria) ||
            numeroCategoria < 1) {
            throw new Error("La categoría proporcionada no es válida");
        }
        categoriaConvertida =
            numeroCategoria;
    }
    return (0, articulo_repository_js_1.buscarArticulosEnBaseDeDatos)(terminoLimpio, categoriaConvertida);
}
async function obtenerMisArticulos(vendedorId) {
    const idConvertido = convertirVendedorId(vendedorId);
    return (0, articulo_repository_js_1.obtenerArticulosPorVendedorId)(idConvertido);
}
async function obtenerArticuloPorId(articuloId) {
    const idConvertido = convertirArticuloId(articuloId);
    return (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(idConvertido);
}
async function crearArticulo(entrada) {
    const datosArticulo = validarDatosArticulo(entrada);
    const vendedorId = Number(entrada.vendedorId);
    if (!Number.isInteger(vendedorId) ||
        vendedorId < 1) {
        throw new Error("El vendedor proporcionado no es válido");
    }
    const datos = {
        ...datosArticulo,
        vendedorId,
    };
    const articuloId = await (0, articulo_repository_js_1.crearArticuloEnBaseDeDatos)(datos);
    const articulo = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(articuloId);
    if (!articulo) {
        throw new Error("El artículo fue creado, pero no pudo recuperarse");
    }
    return articulo;
}
async function actualizarArticulo(articuloId, entrada, vendedorId) {
    const idConvertido = convertirArticuloId(articuloId);
    const datos = validarDatosArticulo(entrada);
    const articuloActual = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(idConvertido);
    if (!articuloActual) {
        throw new Error("El artículo no existe");
    }
    if (vendedorId !== undefined) {
        const vendedorConvertido = convertirVendedorId(vendedorId);
        verificarPropietario(articuloActual, vendedorConvertido);
    }
    const actualizado = await (0, articulo_repository_js_1.actualizarArticuloEnBaseDeDatos)(idConvertido, datos);
    if (!actualizado) {
        throw new Error("No se pudo actualizar el artículo");
    }
    const articuloActualizado = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(idConvertido);
    if (!articuloActualizado) {
        throw new Error("El artículo fue actualizado, pero no pudo recuperarse");
    }
    return articuloActualizado;
}
async function actualizarEstadoArticulo(articuloId, entrada, vendedorId) {
    const idConvertido = convertirArticuloId(articuloId);
    const estado = entrada.estado;
    if (estado !== "activo" &&
        estado !== "vendido") {
        throw new Error("El estado proporcionado no es válido");
    }
    const articuloActual = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(idConvertido);
    if (!articuloActual) {
        throw new Error("El artículo no existe");
    }
    if (vendedorId !== undefined) {
        const vendedorConvertido = convertirVendedorId(vendedorId);
        verificarPropietario(articuloActual, vendedorConvertido);
    }
    const actualizado = await (0, articulo_repository_js_1.actualizarEstadoArticuloEnBaseDeDatos)(idConvertido, estado);
    if (!actualizado) {
        throw new Error("No se pudo actualizar el estado del artículo");
    }
    const articuloActualizado = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(idConvertido);
    if (!articuloActualizado) {
        throw new Error("El estado fue actualizado, pero el artículo no pudo recuperarse");
    }
    return articuloActualizado;
}
async function actualizarArchivadoArticulo(articuloId, entrada, vendedorId) {
    const idConvertido = convertirArticuloId(articuloId);
    const valorArchivado = entrada.archivado;
    if (valorArchivado !== true &&
        valorArchivado !== false &&
        valorArchivado !== 1 &&
        valorArchivado !== 0) {
        throw new Error("El valor de archivado no es válido");
    }
    const archivado = valorArchivado === true ||
        valorArchivado === 1;
    const articuloActual = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(idConvertido);
    if (!articuloActual) {
        throw new Error("El artículo no existe");
    }
    if (vendedorId !== undefined) {
        const vendedorConvertido = convertirVendedorId(vendedorId);
        verificarPropietario(articuloActual, vendedorConvertido);
    }
    const actualizado = await (0, articulo_repository_js_1.actualizarArchivadoArticuloEnBaseDeDatos)(idConvertido, archivado);
    if (!actualizado) {
        throw new Error("No se pudo actualizar el archivo de la publicación");
    }
    const articuloActualizado = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(idConvertido);
    if (!articuloActualizado) {
        throw new Error("La publicación fue actualizada, pero no pudo recuperarse");
    }
    return articuloActualizado;
}
async function eliminarArticulo(articuloId, vendedorId) {
    const idConvertido = convertirArticuloId(articuloId);
    const vendedorConvertido = convertirVendedorId(vendedorId);
    const articuloActual = await (0, articulo_repository_js_1.obtenerArticuloPorIdEnBaseDeDatos)(idConvertido);
    if (!articuloActual) {
        throw new Error("El artículo no existe o ya fue eliminado");
    }
    verificarPropietario(articuloActual, vendedorConvertido);
    const eliminado = await (0, articulo_repository_js_1.eliminarArticuloLogicamenteEnBaseDeDatos)(idConvertido, vendedorConvertido);
    if (!eliminado) {
        throw new Error("No se pudo eliminar la publicación");
    }
}
