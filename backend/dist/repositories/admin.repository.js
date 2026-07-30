"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerResumenAdministracionDesdeBaseDeDatos = obtenerResumenAdministracionDesdeBaseDeDatos;
exports.obtenerUsuariosAdministracionDesdeBaseDeDatos = obtenerUsuariosAdministracionDesdeBaseDeDatos;
exports.obtenerUsuarioAdministracionPorIdDesdeBaseDeDatos = obtenerUsuarioAdministracionPorIdDesdeBaseDeDatos;
exports.actualizarEstadoUsuarioDesdeBaseDeDatos = actualizarEstadoUsuarioDesdeBaseDeDatos;
exports.obtenerPublicacionesAdministracionDesdeBaseDeDatos = obtenerPublicacionesAdministracionDesdeBaseDeDatos;
exports.obtenerPublicacionAdministracionPorIdDesdeBaseDeDatos = obtenerPublicacionAdministracionPorIdDesdeBaseDeDatos;
exports.actualizarEstadoPublicacionDesdeBaseDeDatos = actualizarEstadoPublicacionDesdeBaseDeDatos;
exports.obtenerCategoriasAdministracionDesdeBaseDeDatos = obtenerCategoriasAdministracionDesdeBaseDeDatos;
exports.obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos = obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos;
exports.obtenerCategoriaAdministracionPorNombreDesdeBaseDeDatos = obtenerCategoriaAdministracionPorNombreDesdeBaseDeDatos;
exports.crearCategoriaAdministracionDesdeBaseDeDatos = crearCategoriaAdministracionDesdeBaseDeDatos;
exports.actualizarCategoriaAdministracionDesdeBaseDeDatos = actualizarCategoriaAdministracionDesdeBaseDeDatos;
exports.actualizarEstadoCategoriaAdministracionDesdeBaseDeDatos = actualizarEstadoCategoriaAdministracionDesdeBaseDeDatos;
exports.obtenerUsuariosPorMesDesdeBaseDeDatos = obtenerUsuariosPorMesDesdeBaseDeDatos;
exports.obtenerPublicacionesPorMesDesdeBaseDeDatos = obtenerPublicacionesPorMesDesdeBaseDeDatos;
exports.obtenerPublicacionesPorEstadoDesdeBaseDeDatos = obtenerPublicacionesPorEstadoDesdeBaseDeDatos;
exports.obtenerPublicacionesPorCategoriaDesdeBaseDeDatos = obtenerPublicacionesPorCategoriaDesdeBaseDeDatos;
const database_js_1 = require("../config/database.js");
async function obtenerResumenAdministracionDesdeBaseDeDatos() {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          (
            SELECT COUNT(*)
            FROM usuarios
          ) AS total_usuarios,

          (
            SELECT COUNT(*)
            FROM usuarios
            WHERE activo = 1
          ) AS usuarios_activos,

          (
            SELECT COUNT(*)
            FROM articulos
          ) AS total_publicaciones,

          (
            SELECT COUNT(*)
            FROM articulos
            WHERE estado = 'activo'
              AND archivado = 0
          ) AS publicaciones_activas,

          (
            SELECT COUNT(*)
            FROM articulos
            WHERE estado = 'vendido'
          ) AS publicaciones_vendidas,

          (
            SELECT COUNT(*)
            FROM articulos
            WHERE estado = 'archivado'
               OR archivado = 1
          ) AS publicaciones_archivadas,

          (
            SELECT COUNT(*)
            FROM categorias
            WHERE activo = 1
          ) AS total_categorias
      `);
    const resumen = filas[0];
    if (!resumen) {
        throw new Error("No se pudo obtener el resumen administrativo");
    }
    return resumen;
}
async function obtenerUsuariosAdministracionDesdeBaseDeDatos() {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          usuario_id,
          nombre,
          apellido,
          email,
          telefono,
          ubicacion,
          rol,
          activo,
          fecha_registro
        FROM usuarios
        ORDER BY fecha_registro DESC
      `);
    return filas;
}
async function obtenerUsuarioAdministracionPorIdDesdeBaseDeDatos(usuarioId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          usuario_id,
          nombre,
          apellido,
          email,
          telefono,
          ubicacion,
          rol,
          activo,
          fecha_registro
        FROM usuarios
        WHERE usuario_id = ?
        LIMIT 1
      `, [usuarioId]);
    return filas[0] ?? null;
}
async function actualizarEstadoUsuarioDesdeBaseDeDatos(usuarioId, activo) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE usuarios
        SET activo = ?
        WHERE usuario_id = ?
      `, [
        activo ? 1 : 0,
        usuarioId,
    ]);
    return resultado.affectedRows > 0;
}
async function obtenerPublicacionesAdministracionDesdeBaseDeDatos() {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          a.articulo_id,
          a.titulo,
          a.precio,
          a.condicion,
          a.estado,
          a.archivado,
          a.fecha_publicacion,
          c.nombre AS categoria,
          u.usuario_id AS vendedor_id,
          CONCAT(
            u.nombre,
            ' ',
            u.apellido
          ) AS vendedor_nombre,
          u.email AS vendedor_email
        FROM articulos AS a
        INNER JOIN categorias AS c
          ON c.categoria_id =
            a.categoria_id
        INNER JOIN usuarios AS u
          ON u.usuario_id =
            a.vendedor_id
        ORDER BY a.fecha_publicacion DESC
      `);
    return filas;
}
async function obtenerPublicacionAdministracionPorIdDesdeBaseDeDatos(articuloId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          a.articulo_id,
          a.titulo,
          a.precio,
          a.condicion,
          a.estado,
          a.archivado,
          a.fecha_publicacion,
          c.nombre AS categoria,
          u.usuario_id AS vendedor_id,
          CONCAT(
            u.nombre,
            ' ',
            u.apellido
          ) AS vendedor_nombre,
          u.email AS vendedor_email
        FROM articulos AS a
        INNER JOIN categorias AS c
          ON c.categoria_id =
            a.categoria_id
        INNER JOIN usuarios AS u
          ON u.usuario_id =
            a.vendedor_id
        WHERE a.articulo_id = ?
        LIMIT 1
      `, [articuloId]);
    return filas[0] ?? null;
}
async function actualizarEstadoPublicacionDesdeBaseDeDatos(articuloId, estado) {
    const archivado = estado === "archivado" ? 1 : 0;
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE articulos
        SET
          estado = ?,
          archivado = ?
        WHERE articulo_id = ?
      `, [
        estado,
        archivado,
        articuloId,
    ]);
    return resultado.affectedRows > 0;
}
async function obtenerCategoriasAdministracionDesdeBaseDeDatos() {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          categoria_id,
          nombre,
          descripcion,
          activo,
          fecha_creacion
        FROM categorias
        ORDER BY
          activo DESC,
          nombre ASC
      `);
    return filas;
}
async function obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos(categoriaId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          categoria_id,
          nombre,
          descripcion,
          activo,
          fecha_creacion
        FROM categorias
        WHERE categoria_id = ?
        LIMIT 1
      `, [categoriaId]);
    return filas[0] ?? null;
}
async function obtenerCategoriaAdministracionPorNombreDesdeBaseDeDatos(nombre, excluirCategoriaId) {
    const parametros = [nombre];
    let consulta = `
    SELECT
      categoria_id,
      nombre,
      descripcion,
      activo,
      fecha_creacion
    FROM categorias
    WHERE LOWER(nombre) = LOWER(?)
  `;
    if (excluirCategoriaId !== undefined) {
        consulta += `
      AND categoria_id <> ?
    `;
        parametros.push(excluirCategoriaId);
    }
    consulta += `
    LIMIT 1
  `;
    const [filas] = await database_js_1.pool.execute(consulta, parametros);
    return filas[0] ?? null;
}
async function crearCategoriaAdministracionDesdeBaseDeDatos(datos) {
    const [resultado] = await database_js_1.pool.execute(`
        INSERT INTO categorias (
          nombre,
          descripcion,
          activo
        )
        VALUES (?, ?, 1)
      `, [
        datos.nombre,
        datos.descripcion,
    ]);
    return resultado.insertId;
}
async function actualizarCategoriaAdministracionDesdeBaseDeDatos(categoriaId, datos) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE categorias
        SET
          nombre = ?,
          descripcion = ?
        WHERE categoria_id = ?
      `, [
        datos.nombre,
        datos.descripcion,
        categoriaId,
    ]);
    return resultado.affectedRows > 0;
}
async function actualizarEstadoCategoriaAdministracionDesdeBaseDeDatos(categoriaId, activo) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE categorias
        SET activo = ?
        WHERE categoria_id = ?
      `, [
        activo ? 1 : 0,
        categoriaId,
    ]);
    return resultado.affectedRows > 0;
}
async function obtenerUsuariosPorMesDesdeBaseDeDatos() {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          DATE_FORMAT(
            fecha_registro,
            '%Y-%m'
          ) AS periodo,
          YEAR(fecha_registro) AS anio,
          MONTH(fecha_registro) AS mes,
          COUNT(*) AS total
        FROM usuarios
        WHERE fecha_registro >=
          DATE_SUB(
            DATE_FORMAT(
              CURRENT_DATE,
              '%Y-%m-01'
            ),
            INTERVAL 11 MONTH
          )
        GROUP BY
          YEAR(fecha_registro),
          MONTH(fecha_registro),
          DATE_FORMAT(
            fecha_registro,
            '%Y-%m'
          )
        ORDER BY
          anio ASC,
          mes ASC
      `);
    return filas;
}
async function obtenerPublicacionesPorMesDesdeBaseDeDatos() {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          DATE_FORMAT(
            fecha_publicacion,
            '%Y-%m'
          ) AS periodo,
          YEAR(fecha_publicacion) AS anio,
          MONTH(fecha_publicacion) AS mes,
          COUNT(*) AS total
        FROM articulos
        WHERE fecha_publicacion >=
          DATE_SUB(
            DATE_FORMAT(
              CURRENT_DATE,
              '%Y-%m-01'
            ),
            INTERVAL 11 MONTH
          )
        GROUP BY
          YEAR(fecha_publicacion),
          MONTH(fecha_publicacion),
          DATE_FORMAT(
            fecha_publicacion,
            '%Y-%m'
          )
        ORDER BY
          anio ASC,
          mes ASC
      `);
    return filas;
}
async function obtenerPublicacionesPorEstadoDesdeBaseDeDatos() {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          estado,
          total
        FROM (
          SELECT
            CASE
              WHEN estado = 'archivado'
                OR archivado = 1
                THEN 'archivado'
              WHEN estado = 'vendido'
                THEN 'vendido'
              ELSE 'activo'
            END AS estado,
            COUNT(*) AS total
          FROM articulos
          GROUP BY
            CASE
              WHEN estado = 'archivado'
                OR archivado = 1
                THEN 'archivado'
              WHEN estado = 'vendido'
                THEN 'vendido'
              ELSE 'activo'
            END
        ) AS estadisticas
        ORDER BY
          FIELD(
            estado,
            'activo',
            'vendido',
            'archivado'
          )
      `);
    return filas;
}
async function obtenerPublicacionesPorCategoriaDesdeBaseDeDatos() {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          c.categoria_id,
          c.nombre AS categoria,
          COUNT(a.articulo_id) AS total
        FROM categorias AS c
        LEFT JOIN articulos AS a
          ON a.categoria_id =
            c.categoria_id
        GROUP BY
          c.categoria_id,
          c.nombre
        ORDER BY
          total DESC,
          c.nombre ASC
      `);
    return filas;
}
