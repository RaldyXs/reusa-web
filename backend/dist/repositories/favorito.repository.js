"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerFavoritosPorUsuarioDesdeBaseDeDatos = obtenerFavoritosPorUsuarioDesdeBaseDeDatos;
exports.buscarFavoritoDesdeBaseDeDatos = buscarFavoritoDesdeBaseDeDatos;
exports.crearFavoritoEnBaseDeDatos = crearFavoritoEnBaseDeDatos;
exports.eliminarFavoritoDesdeBaseDeDatos = eliminarFavoritoDesdeBaseDeDatos;
exports.obtenerIdsFavoritosPorUsuarioDesdeBaseDeDatos = obtenerIdsFavoritosPorUsuarioDesdeBaseDeDatos;
const database_js_1 = require("../config/database.js");
async function obtenerFavoritosPorUsuarioDesdeBaseDeDatos(usuarioId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          f.favorito_id,
          f.fecha_guardado,

          a.articulo_id,
          a.vendedor_id,
          a.categoria_id,
          a.titulo,
          a.descripcion,
          a.precio,
          a.condicion,
          a.ubicacion,
          a.estado,
          a.archivado,
          a.fecha_publicacion,

          c.nombre AS categoria,

          CONCAT(
            u.nombre,
            ' ',
            u.apellido
          ) AS vendedor,

          (
            SELECT
              ia.url_imagen
            FROM imagenes_articulos AS ia
            WHERE
              ia.articulo_id =
                a.articulo_id
            ORDER BY
              ia.es_principal DESC,
              ia.orden ASC,
              ia.imagen_id ASC
            LIMIT 1
          ) AS imagen_principal

        FROM favoritos AS f

        INNER JOIN articulos AS a
          ON a.articulo_id =
            f.articulo_id

        INNER JOIN categorias AS c
          ON c.categoria_id =
            a.categoria_id

        INNER JOIN usuarios AS u
          ON u.usuario_id =
            a.vendedor_id

        WHERE
          f.usuario_id = ?

        ORDER BY
          f.fecha_guardado DESC
      `, [usuarioId]);
    return filas.map((favorito) => ({
        ...favorito,
        archivado: Number(favorito.archivado ?? 0),
        imagenes: [],
    }));
}
async function buscarFavoritoDesdeBaseDeDatos(usuarioId, articuloId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          favorito_id
        FROM favoritos
        WHERE
          usuario_id = ?
          AND articulo_id = ?
        LIMIT 1
      `, [
        usuarioId,
        articuloId,
    ]);
    return filas[0]?.favorito_id ?? null;
}
async function crearFavoritoEnBaseDeDatos(usuarioId, articuloId) {
    const [resultado] = await database_js_1.pool.execute(`
        INSERT INTO favoritos (
          usuario_id,
          articulo_id
        )
        VALUES (?, ?)
      `, [
        usuarioId,
        articuloId,
    ]);
    return resultado.insertId;
}
async function eliminarFavoritoDesdeBaseDeDatos(usuarioId, articuloId) {
    const [resultado] = await database_js_1.pool.execute(`
        DELETE FROM favoritos
        WHERE
          usuario_id = ?
          AND articulo_id = ?
      `, [
        usuarioId,
        articuloId,
    ]);
    return resultado.affectedRows > 0;
}
async function obtenerIdsFavoritosPorUsuarioDesdeBaseDeDatos(usuarioId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          articulo_id
        FROM favoritos
        WHERE usuario_id = ?
        ORDER BY fecha_guardado DESC
      `, [usuarioId]);
    return filas.map((fila) => Number(fila.articulo_id));
}
