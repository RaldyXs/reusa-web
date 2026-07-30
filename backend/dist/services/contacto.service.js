"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerContactoVendedor = obtenerContactoVendedor;
const contacto_repository_js_1 = require("../repositories/contacto.repository.js");
function validarIdentificador(valor, nombre) {
    if (!Number.isInteger(valor) ||
        valor <= 0) {
        throw new Error(`El identificador de ${nombre} no es válido`);
    }
}
async function obtenerContactoVendedor(usuarioId, articuloId) {
    validarIdentificador(usuarioId, "usuario");
    validarIdentificador(articuloId, "artículo");
    const contacto = await (0, contacto_repository_js_1.obtenerContactoVendedorDesdeBaseDeDatos)(articuloId);
    if (!contacto) {
        throw new Error("El artículo indicado no existe");
    }
    if (Number(contacto.vendedor_id) ===
        usuarioId) {
        throw new Error("No puedes solicitar tus propios datos de contacto");
    }
    return contacto;
}
