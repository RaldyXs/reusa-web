"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerCategorias = obtenerCategorias;
const categoria_service_js_1 = require("../services/categoria.service.js");
async function obtenerCategorias(_request, response) {
    try {
        const categorias = await (0, categoria_service_js_1.listarCategorias)();
        response.status(200).json({
            ok: true,
            categorias,
        });
    }
    catch (errorDesconocido) {
        console.error("Error al obtener las categorías:", errorDesconocido);
        response.status(500).json({
            ok: false,
            message: "No se pudieron obtener las categorías",
        });
    }
}
