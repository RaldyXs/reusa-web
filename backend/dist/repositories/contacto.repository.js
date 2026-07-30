"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerContactoVendedorDesdeBaseDeDatos = obtenerContactoVendedorDesdeBaseDeDatos;
const database_js_1 = require("../config/database.js");
async function obtenerContactoVendedorDesdeBaseDeDatos(articuloId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          a.articulo_id,
          a.vendedor_id,
          CONCAT(
            u.nombre,
            ' ',
            u.apellido
          ) AS vendedor,
          u.email,
          u.telefono
        FROM articulos AS a
        INNER JOIN usuarios AS u
          ON u.usuario_id =
            a.vendedor_id
        WHERE a.articulo_id = ?
        LIMIT 1
      `, [articuloId]);
    return filas[0] ?? null;
}
