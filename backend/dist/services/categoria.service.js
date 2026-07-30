"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarCategorias = listarCategorias;
const categoria_repository_js_1 = require("../repositories/categoria.repository.js");
async function listarCategorias() {
    return (0, categoria_repository_js_1.obtenerCategoriasDesdeBaseDeDatos)();
}
