"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerCategoriasDesdeBaseDeDatos = obtenerCategoriasDesdeBaseDeDatos;
const database_js_1 = require("../config/database.js");
async function obtenerCategoriasDesdeBaseDeDatos() {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          categoria_id,
          nombre,
          descripcion,
          activo,
          fecha_creacion
        FROM categorias
        WHERE activo = 1
        ORDER BY nombre ASC
      `);
    return filas;
}
