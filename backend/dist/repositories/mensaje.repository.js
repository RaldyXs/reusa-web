"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarConversacionExistenteEnBaseDeDatos = buscarConversacionExistenteEnBaseDeDatos;
exports.crearConversacionEnBaseDeDatos = crearConversacionEnBaseDeDatos;
exports.obtenerConversacionPorIdEnBaseDeDatos = obtenerConversacionPorIdEnBaseDeDatos;
exports.obtenerConversacionesDeUsuarioEnBaseDeDatos = obtenerConversacionesDeUsuarioEnBaseDeDatos;
exports.obtenerMensajesDeConversacionEnBaseDeDatos = obtenerMensajesDeConversacionEnBaseDeDatos;
exports.obtenerMensajePorIdEnBaseDeDatos = obtenerMensajePorIdEnBaseDeDatos;
exports.crearMensajeEnBaseDeDatos = crearMensajeEnBaseDeDatos;
exports.actualizarMensajeEnBaseDeDatos = actualizarMensajeEnBaseDeDatos;
exports.eliminarMensajeEnBaseDeDatos = eliminarMensajeEnBaseDeDatos;
exports.marcarMensajesComoLeidosEnBaseDeDatos = marcarMensajesComoLeidosEnBaseDeDatos;
const database_js_1 = require("../config/database.js");
async function buscarConversacionExistenteEnBaseDeDatos(articuloId, compradorId, vendedorId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          conversacion_id
        FROM conversaciones
        WHERE articulo_id = ?
          AND comprador_id = ?
          AND vendedor_id = ?
        LIMIT 1
      `, [
        articuloId,
        compradorId,
        vendedorId,
    ]);
    return (filas[0]?.conversacion_id ??
        null);
}
async function crearConversacionEnBaseDeDatos(datos) {
    const [resultado] = await database_js_1.pool.execute(`
        INSERT INTO conversaciones (
          articulo_id,
          comprador_id,
          vendedor_id
        )
        VALUES (?, ?, ?)
      `, [
        datos.articuloId,
        datos.compradorId,
        datos.vendedorId,
    ]);
    return resultado.insertId;
}
async function obtenerConversacionPorIdEnBaseDeDatos(conversacionId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          conversacion_id,
          articulo_id,
          comprador_id,
          vendedor_id
        FROM conversaciones
        WHERE conversacion_id = ?
        LIMIT 1
      `, [conversacionId]);
    return filas[0] ?? null;
}
async function obtenerConversacionesDeUsuarioEnBaseDeDatos(usuarioId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          c.conversacion_id,
          c.articulo_id,
          c.comprador_id,
          c.vendedor_id,
          c.fecha_creacion,
          c.fecha_actualizacion,

          a.titulo AS articulo_titulo,

          (
            SELECT
              ia.url_imagen
            FROM imagenes_articulos AS ia
            WHERE ia.articulo_id =
              c.articulo_id
            ORDER BY
              ia.es_principal DESC,
              ia.orden ASC,
              ia.imagen_id ASC
            LIMIT 1
          ) AS imagen_principal,

          CASE
            WHEN c.comprador_id = ?
              THEN c.vendedor_id
            ELSE c.comprador_id
          END AS otro_usuario_id,

          CASE
            WHEN c.comprador_id = ?
              THEN CONCAT(
                vendedor.nombre,
                ' ',
                vendedor.apellido
              )
            ELSE CONCAT(
              comprador.nombre,
              ' ',
              comprador.apellido
            )
          END AS otro_usuario_nombre,

          (
            SELECT
              CASE
                WHEN m.eliminado = 1
                  THEN 'Mensaje eliminado'

                WHEN m.tipo = 'imagen'
                  AND (
                    m.contenido IS NULL
                    OR TRIM(m.contenido) = ''
                  )
                  THEN 'Imagen'

                WHEN m.tipo = 'imagen'
                  THEN CONCAT(
                    'Imagen: ',
                    m.contenido
                  )

                ELSE m.contenido
              END
            FROM mensajes AS m
            WHERE m.conversacion_id =
              c.conversacion_id
            ORDER BY
              m.fecha_envio DESC,
              m.mensaje_id DESC
            LIMIT 1
          ) AS ultimo_mensaje,

          (
            SELECT
              m.fecha_envio
            FROM mensajes AS m
            WHERE m.conversacion_id =
              c.conversacion_id
            ORDER BY
              m.fecha_envio DESC,
              m.mensaje_id DESC
            LIMIT 1
          ) AS fecha_ultimo_mensaje,

          (
            SELECT
              COUNT(*)
            FROM mensajes AS m
            WHERE m.conversacion_id =
              c.conversacion_id
              AND m.remitente_id <> ?
              AND m.leido = 0
          ) AS mensajes_no_leidos

        FROM conversaciones AS c

        INNER JOIN articulos AS a
          ON a.articulo_id =
            c.articulo_id

        INNER JOIN usuarios AS comprador
          ON comprador.usuario_id =
            c.comprador_id

        INNER JOIN usuarios AS vendedor
          ON vendedor.usuario_id =
            c.vendedor_id

        WHERE c.comprador_id = ?
           OR c.vendedor_id = ?

        ORDER BY
          COALESCE(
            fecha_ultimo_mensaje,
            c.fecha_actualizacion
          ) DESC
      `, [
        usuarioId,
        usuarioId,
        usuarioId,
        usuarioId,
        usuarioId,
    ]);
    return filas;
}
async function obtenerMensajesDeConversacionEnBaseDeDatos(conversacionId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          m.mensaje_id,
          m.conversacion_id,
          m.remitente_id,

          CASE
            WHEN m.eliminado = 1
              THEN 'Mensaje eliminado'
            ELSE m.contenido
          END AS contenido,

          m.tipo,

          CASE
            WHEN m.eliminado = 1
              THEN NULL
            ELSE m.url_imagen
          END AS url_imagen,

          m.editado,
          m.eliminado,
          m.leido,
          m.fecha_envio,
          m.fecha_edicion,

          CONCAT(
            u.nombre,
            ' ',
            u.apellido
          ) AS remitente_nombre

        FROM mensajes AS m

        INNER JOIN usuarios AS u
          ON u.usuario_id =
            m.remitente_id

        WHERE m.conversacion_id = ?

        ORDER BY
          m.fecha_envio ASC,
          m.mensaje_id ASC
      `, [conversacionId]);
    return filas.map((mensaje) => ({
        ...mensaje,
        leido: Number(mensaje.leido),
        editado: Number(mensaje.editado),
        eliminado: Number(mensaje.eliminado),
    }));
}
async function obtenerMensajePorIdEnBaseDeDatos(mensajeId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          mensaje_id,
          conversacion_id,
          remitente_id,
          contenido,
          tipo,
          url_imagen,
          editado,
          eliminado
        FROM mensajes
        WHERE mensaje_id = ?
        LIMIT 1
      `, [mensajeId]);
    return filas[0] ?? null;
}
async function crearMensajeEnBaseDeDatos(datos) {
    const conexion = await database_js_1.pool.getConnection();
    try {
        await conexion.beginTransaction();
        const tipo = datos.tipo ?? "texto";
        const urlImagen = datos.urlImagen ?? null;
        const [resultado] = await conexion.execute(`
          INSERT INTO mensajes (
            conversacion_id,
            remitente_id,
            contenido,
            tipo,
            url_imagen,
            editado,
            eliminado
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            0,
            0
          )
        `, [
            datos.conversacionId,
            datos.remitenteId,
            datos.contenido,
            tipo,
            urlImagen,
        ]);
        await conexion.execute(`
        UPDATE conversaciones
        SET
          fecha_actualizacion =
            CURRENT_TIMESTAMP
        WHERE conversacion_id = ?
      `, [
            datos.conversacionId,
        ]);
        await conexion.commit();
        return resultado.insertId;
    }
    catch (error) {
        await conexion.rollback();
        throw error;
    }
    finally {
        conexion.release();
    }
}
async function actualizarMensajeEnBaseDeDatos(mensajeId, remitenteId, contenido) {
    const conexion = await database_js_1.pool.getConnection();
    try {
        await conexion.beginTransaction();
        const [resultado] = await conexion.execute(`
          UPDATE mensajes
          SET
            contenido = ?,
            editado = 1,
            fecha_edicion =
              CURRENT_TIMESTAMP
          WHERE mensaje_id = ?
            AND remitente_id = ?
            AND eliminado = 0
            AND tipo = 'texto'
        `, [
            contenido,
            mensajeId,
            remitenteId,
        ]);
        if (resultado.affectedRows >
            0) {
            await conexion.execute(`
          UPDATE conversaciones AS c

          INNER JOIN mensajes AS m
            ON m.conversacion_id =
              c.conversacion_id

          SET
            c.fecha_actualizacion =
              CURRENT_TIMESTAMP

          WHERE m.mensaje_id = ?
        `, [mensajeId]);
        }
        await conexion.commit();
        return (resultado.affectedRows >
            0);
    }
    catch (error) {
        await conexion.rollback();
        throw error;
    }
    finally {
        conexion.release();
    }
}
async function eliminarMensajeEnBaseDeDatos(mensajeId, remitenteId) {
    const conexion = await database_js_1.pool.getConnection();
    try {
        await conexion.beginTransaction();
        const [resultado] = await conexion.execute(`
          UPDATE mensajes
          SET
            contenido =
              'Mensaje eliminado',
            url_imagen = NULL,
            eliminado = 1,
            editado = 0,
            fecha_edicion =
              CURRENT_TIMESTAMP
          WHERE mensaje_id = ?
            AND remitente_id = ?
            AND eliminado = 0
        `, [
            mensajeId,
            remitenteId,
        ]);
        if (resultado.affectedRows >
            0) {
            await conexion.execute(`
          UPDATE conversaciones AS c

          INNER JOIN mensajes AS m
            ON m.conversacion_id =
              c.conversacion_id

          SET
            c.fecha_actualizacion =
              CURRENT_TIMESTAMP

          WHERE m.mensaje_id = ?
        `, [mensajeId]);
        }
        await conexion.commit();
        return (resultado.affectedRows >
            0);
    }
    catch (error) {
        await conexion.rollback();
        throw error;
    }
    finally {
        conexion.release();
    }
}
async function marcarMensajesComoLeidosEnBaseDeDatos(conversacionId, usuarioId) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE mensajes
        SET
          leido = 1
        WHERE conversacion_id = ?
          AND remitente_id <> ?
          AND leido = 0
      `, [
        conversacionId,
        usuarioId,
    ]);
    return resultado.affectedRows;
}
