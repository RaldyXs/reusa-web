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
          u.telefono,
          u.mostrar_contacto
        FROM articulos AS a

        INNER JOIN usuarios AS u
          ON u.usuario_id =
            a.vendedor_id

        WHERE a.articulo_id = ?
          AND a.eliminado = 0
          AND u.activo = 1
          AND u.mostrar_contacto = 1

        LIMIT 1
      `, [articuloId]);
    return filas[0] ?? null;
}
