"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarArticulosEnBaseDeDatos = buscarArticulosEnBaseDeDatos;
exports.obtenerArticulosPorVendedorId = obtenerArticulosPorVendedorId;
exports.obtenerArticuloPorIdEnBaseDeDatos = obtenerArticuloPorIdEnBaseDeDatos;
exports.crearArticuloEnBaseDeDatos = crearArticuloEnBaseDeDatos;
exports.actualizarArticuloEnBaseDeDatos = actualizarArticuloEnBaseDeDatos;
exports.actualizarEstadoArticuloEnBaseDeDatos = actualizarEstadoArticuloEnBaseDeDatos;
exports.actualizarArchivadoArticuloEnBaseDeDatos = actualizarArchivadoArticuloEnBaseDeDatos;
exports.existeArticuloPorId = existeArticuloPorId;
exports.contarImagenesArticulo = contarImagenesArticulo;
exports.guardarImagenesArticuloEnBaseDeDatos = guardarImagenesArticuloEnBaseDeDatos;
exports.eliminarImagenArticuloEnBaseDeDatos = eliminarImagenArticuloEnBaseDeDatos;
const database_js_1 = require("../config/database.js");
async function buscarArticulosEnBaseDeDatos(termino, categoriaId) {
    const [resultado] = await database_js_1.pool.query("CALL sp_buscar_articulos(?, ?)", [termino, categoriaId]);
    return resultado[0].map((articulo) => ({
        ...articulo,
        archivado: Number(articulo.archivado ?? 0),
    }));
}
async function obtenerArticulosPorVendedorId(vendedorId) {
    const [filas] = await database_js_1.pool.execute(`
      SELECT
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
          SELECT ia.url_imagen
          FROM imagenes_articulos ia
          WHERE ia.articulo_id = a.articulo_id
          ORDER BY
            ia.es_principal DESC,
            ia.orden ASC,
            ia.imagen_id ASC
          LIMIT 1
        ) AS imagen_principal
      FROM articulos a
      INNER JOIN categorias c
        ON c.categoria_id = a.categoria_id
      INNER JOIN usuarios u
        ON u.usuario_id = a.vendedor_id
      WHERE a.vendedor_id = ?
      ORDER BY a.fecha_publicacion DESC
    `, [vendedorId]);
    return filas.map((articulo) => ({
        ...articulo,
        archivado: Number(articulo.archivado ?? 0),
        imagenes: [],
    }));
}
async function obtenerArticuloPorIdEnBaseDeDatos(articuloId) {
    const [filas] = await database_js_1.pool.execute(`
      SELECT
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
          SELECT ia.url_imagen
          FROM imagenes_articulos ia
          WHERE ia.articulo_id = a.articulo_id
          ORDER BY
            ia.es_principal DESC,
            ia.orden ASC,
            ia.imagen_id ASC
          LIMIT 1
        ) AS imagen_principal
      FROM articulos a
      INNER JOIN categorias c
        ON c.categoria_id = a.categoria_id
      INNER JOIN usuarios u
        ON u.usuario_id = a.vendedor_id
      WHERE a.articulo_id = ?
      LIMIT 1
    `, [articuloId]);
    const articulo = filas[0];
    if (!articulo) {
        return null;
    }
    const [filasImagenes] = await database_js_1.pool.execute(`
        SELECT url_imagen
        FROM imagenes_articulos
        WHERE articulo_id = ?
        ORDER BY
          es_principal DESC,
          orden ASC,
          imagen_id ASC
      `, [articuloId]);
    return {
        ...articulo,
        archivado: Number(articulo.archivado),
        imagenes: filasImagenes.map((imagen) => imagen.url_imagen),
    };
}
async function crearArticuloEnBaseDeDatos(datos) {
    const [resultado] = await database_js_1.pool.execute(`
        INSERT INTO articulos (
          vendedor_id,
          categoria_id,
          titulo,
          descripcion,
          precio,
          condicion,
          ubicacion,
          estado,
          archivado
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'activo',
          0
        )
      `, [
        datos.vendedorId,
        datos.categoriaId,
        datos.titulo,
        datos.descripcion,
        datos.precio,
        datos.condicion,
        datos.ubicacion,
    ]);
    return resultado.insertId;
}
async function actualizarArticuloEnBaseDeDatos(articuloId, datos) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE articulos
        SET
          categoria_id = ?,
          titulo = ?,
          descripcion = ?,
          precio = ?,
          condicion = ?,
          ubicacion = ?
        WHERE articulo_id = ?
      `, [
        datos.categoriaId,
        datos.titulo,
        datos.descripcion,
        datos.precio,
        datos.condicion,
        datos.ubicacion,
        articuloId,
    ]);
    return resultado.affectedRows > 0;
}
async function actualizarEstadoArticuloEnBaseDeDatos(articuloId, estado) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE articulos
        SET estado = ?
        WHERE articulo_id = ?
      `, [estado, articuloId]);
    return resultado.affectedRows > 0;
}
async function actualizarArchivadoArticuloEnBaseDeDatos(articuloId, archivado) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE articulos
        SET archivado = ?
        WHERE articulo_id = ?
      `, [
        archivado ? 1 : 0,
        articuloId,
    ]);
    return resultado.affectedRows > 0;
}
async function existeArticuloPorId(articuloId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT articulo_id
        FROM articulos
        WHERE articulo_id = ?
        LIMIT 1
      `, [articuloId]);
    return filas.length > 0;
}
async function contarImagenesArticulo(articuloId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT COUNT(*) AS cantidad
        FROM imagenes_articulos
        WHERE articulo_id = ?
      `, [articuloId]);
    return Number(filas[0]?.cantidad ?? 0);
}
async function guardarImagenesArticuloEnBaseDeDatos(articuloId, imagenes) {
    if (imagenes.length === 0) {
        return;
    }
    const conexion = await database_js_1.pool.getConnection();
    try {
        await conexion.beginTransaction();
        for (const imagen of imagenes) {
            await conexion.execute(`
          INSERT INTO imagenes_articulos (
            articulo_id,
            url_imagen,
            es_principal,
            orden
          )
          VALUES (?, ?, ?, ?)
        `, [
                articuloId,
                imagen.urlImagen,
                imagen.esPrincipal ? 1 : 0,
                imagen.orden,
            ]);
        }
        await conexion.commit();
    }
    catch (error) {
        await conexion.rollback();
        throw error;
    }
    finally {
        conexion.release();
    }
}
async function eliminarImagenArticuloEnBaseDeDatos(articuloId, urlImagen) {
    const conexion = await database_js_1.pool.getConnection();
    try {
        await conexion.beginTransaction();
        const [imagenes] = await conexion.execute(`
          SELECT
            imagen_id,
            es_principal,
            orden
          FROM imagenes_articulos
          WHERE articulo_id = ?
            AND url_imagen = ?
          LIMIT 1
        `, [articuloId, urlImagen]);
        const imagen = imagenes[0];
        if (!imagen) {
            await conexion.rollback();
            return false;
        }
        await conexion.execute(`
        DELETE FROM imagenes_articulos
        WHERE imagen_id = ?
      `, [imagen.imagen_id]);
        if (Number(imagen.es_principal) === 1) {
            const [restantes] = await conexion.execute(`
            SELECT
              imagen_id,
              es_principal,
              orden
            FROM imagenes_articulos
            WHERE articulo_id = ?
            ORDER BY
              orden ASC,
              imagen_id ASC
            LIMIT 1
          `, [articuloId]);
            const nuevaPrincipal = restantes[0];
            if (nuevaPrincipal) {
                await conexion.execute(`
            UPDATE imagenes_articulos
            SET es_principal = 1
            WHERE imagen_id = ?
          `, [
                    nuevaPrincipal.imagen_id,
                ]);
            }
        }
        await conexion.execute(`
        UPDATE imagenes_articulos
        SET orden = orden - 1
        WHERE articulo_id = ?
          AND orden > ?
      `, [
            articuloId,
            imagen.orden,
        ]);
        await conexion.commit();
        return true;
    }
    catch (error) {
        await conexion.rollback();
        throw error;
    }
    finally {
        conexion.release();
    }
}
