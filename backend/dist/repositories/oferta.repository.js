"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearOfertaEnBaseDeDatos = crearOfertaEnBaseDeDatos;
exports.buscarOfertaPendienteEnBaseDeDatos = buscarOfertaPendienteEnBaseDeDatos;
exports.obtenerOfertasRealizadasDesdeBaseDeDatos = obtenerOfertasRealizadasDesdeBaseDeDatos;
exports.obtenerOfertasRecibidasDesdeBaseDeDatos = obtenerOfertasRecibidasDesdeBaseDeDatos;
exports.obtenerOfertaPorIdDesdeBaseDeDatos = obtenerOfertaPorIdDesdeBaseDeDatos;
exports.actualizarEstadoOfertaEnBaseDeDatos = actualizarEstadoOfertaEnBaseDeDatos;
exports.crearContraofertaEnBaseDeDatos = crearContraofertaEnBaseDeDatos;
exports.responderContraofertaEnBaseDeDatos = responderContraofertaEnBaseDeDatos;
const database_js_1 = require("../config/database.js");
async function crearOfertaEnBaseDeDatos(datos) {
    const [resultado] = await database_js_1.pool.execute(`
        INSERT INTO ofertas (
          comprador_id,
          articulo_id,
          precio_ofertado,
          mensaje,
          estado
        )
        VALUES (?, ?, ?, ?, 'pendiente')
      `, [
        datos.compradorId,
        datos.articuloId,
        datos.precioOfertado,
        datos.mensaje,
    ]);
    return resultado.insertId;
}
async function buscarOfertaPendienteEnBaseDeDatos(compradorId, articuloId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT oferta_id
        FROM ofertas
        WHERE comprador_id = ?
          AND articulo_id = ?
          AND estado IN (
            'pendiente',
            'contraoferta'
          )
        LIMIT 1
      `, [
        compradorId,
        articuloId,
    ]);
    return filas[0]?.oferta_id ?? null;
}
async function obtenerOfertasRealizadasDesdeBaseDeDatos(compradorId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          o.oferta_id,
          o.comprador_id,
          o.articulo_id,
          o.precio_ofertado,
          o.precio_contraoferta,
          o.mensaje,
          o.mensaje_contraoferta,
          o.estado,
          o.fecha_oferta,
          o.fecha_respuesta,

          a.titulo AS articulo_titulo,
          a.precio AS articulo_precio,
          a.estado AS articulo_estado,

          a.vendedor_id,

          CONCAT(
            vendedor.nombre,
            ' ',
            vendedor.apellido
          ) AS vendedor_nombre,

          (
            SELECT ia.url_imagen
            FROM imagenes_articulos AS ia
            WHERE ia.articulo_id =
              a.articulo_id
            ORDER BY
              ia.es_principal DESC,
              ia.orden ASC,
              ia.imagen_id ASC
            LIMIT 1
          ) AS imagen_principal

        FROM ofertas AS o

        INNER JOIN articulos AS a
          ON a.articulo_id =
            o.articulo_id

        INNER JOIN usuarios AS vendedor
          ON vendedor.usuario_id =
            a.vendedor_id

        WHERE o.comprador_id = ?

        ORDER BY o.fecha_oferta DESC
      `, [compradorId]);
    return filas;
}
async function obtenerOfertasRecibidasDesdeBaseDeDatos(vendedorId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          o.oferta_id,
          o.comprador_id,
          o.articulo_id,
          o.precio_ofertado,
          o.precio_contraoferta,
          o.mensaje,
          o.mensaje_contraoferta,
          o.estado,
          o.fecha_oferta,
          o.fecha_respuesta,

          a.titulo AS articulo_titulo,
          a.precio AS articulo_precio,
          a.estado AS articulo_estado,

          CONCAT(
            comprador.nombre,
            ' ',
            comprador.apellido
          ) AS comprador_nombre,

          comprador.email AS comprador_email,

          (
            SELECT ia.url_imagen
            FROM imagenes_articulos AS ia
            WHERE ia.articulo_id =
              a.articulo_id
            ORDER BY
              ia.es_principal DESC,
              ia.orden ASC,
              ia.imagen_id ASC
            LIMIT 1
          ) AS imagen_principal

        FROM ofertas AS o

        INNER JOIN articulos AS a
          ON a.articulo_id =
            o.articulo_id

        INNER JOIN usuarios AS comprador
          ON comprador.usuario_id =
            o.comprador_id

        WHERE a.vendedor_id = ?

        ORDER BY
          FIELD(
            o.estado,
            'pendiente',
            'contraoferta',
            'aceptada',
            'rechazada'
          ),
          o.fecha_oferta DESC
      `, [vendedorId]);
    return filas;
}
async function obtenerOfertaPorIdDesdeBaseDeDatos(ofertaId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          o.oferta_id,
          o.articulo_id,
          o.comprador_id,
          o.estado,
          a.vendedor_id
        FROM ofertas AS o
        INNER JOIN articulos AS a
          ON a.articulo_id =
            o.articulo_id
        WHERE o.oferta_id = ?
        LIMIT 1
      `, [ofertaId]);
    return filas[0] ?? null;
}
async function actualizarEstadoOfertaEnBaseDeDatos(ofertaId, vendedorId, estado) {
    const conexion = await database_js_1.pool.getConnection();
    try {
        await conexion.beginTransaction();
        const [ofertas] = await conexion.execute(`
          SELECT
            o.oferta_id,
            o.articulo_id,
            o.comprador_id,
            o.estado,
            a.vendedor_id
          FROM ofertas AS o
          INNER JOIN articulos AS a
            ON a.articulo_id =
              o.articulo_id
          WHERE o.oferta_id = ?
          FOR UPDATE
        `, [ofertaId]);
        const oferta = ofertas[0];
        if (!oferta ||
            Number(oferta.vendedor_id) !==
                vendedorId ||
            oferta.estado !== "pendiente") {
            await conexion.rollback();
            return false;
        }
        const [resultado] = await conexion.execute(`
          UPDATE ofertas
          SET
            estado = ?,
            fecha_respuesta =
              CURRENT_TIMESTAMP
          WHERE oferta_id = ?
            AND estado = 'pendiente'
        `, [
            estado,
            ofertaId,
        ]);
        if (resultado.affectedRows === 0) {
            await conexion.rollback();
            return false;
        }
        if (estado === "aceptada") {
            await conexion.execute(`
          UPDATE articulos
          SET estado = 'vendido'
          WHERE articulo_id = ?
        `, [oferta.articulo_id]);
            await conexion.execute(`
          UPDATE ofertas
          SET
            estado = 'rechazada',
            fecha_respuesta =
              CURRENT_TIMESTAMP
          WHERE articulo_id = ?
            AND oferta_id <> ?
            AND estado IN (
              'pendiente',
              'contraoferta'
            )
        `, [
                oferta.articulo_id,
                ofertaId,
            ]);
        }
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
async function crearContraofertaEnBaseDeDatos(datos) {
    const conexion = await database_js_1.pool.getConnection();
    try {
        await conexion.beginTransaction();
        const [ofertas] = await conexion.execute(`
          SELECT
            o.oferta_id,
            o.articulo_id,
            o.comprador_id,
            o.estado,
            a.vendedor_id
          FROM ofertas AS o
          INNER JOIN articulos AS a
            ON a.articulo_id =
              o.articulo_id
          WHERE o.oferta_id = ?
          FOR UPDATE
        `, [datos.ofertaId]);
        const oferta = ofertas[0];
        if (!oferta ||
            Number(oferta.vendedor_id) !==
                datos.vendedorId ||
            oferta.estado !== "pendiente") {
            await conexion.rollback();
            return false;
        }
        const [resultado] = await conexion.execute(`
          UPDATE ofertas
          SET
            precio_contraoferta = ?,
            mensaje_contraoferta = ?,
            estado = 'contraoferta',
            fecha_respuesta =
              CURRENT_TIMESTAMP
          WHERE oferta_id = ?
            AND estado = 'pendiente'
        `, [
            datos.precioContraoferta,
            datos.mensajeContraoferta,
            datos.ofertaId,
        ]);
        if (resultado.affectedRows === 0) {
            await conexion.rollback();
            return false;
        }
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
async function responderContraofertaEnBaseDeDatos(datos) {
    const conexion = await database_js_1.pool.getConnection();
    try {
        await conexion.beginTransaction();
        const [ofertas] = await conexion.execute(`
          SELECT
            o.oferta_id,
            o.articulo_id,
            o.comprador_id,
            o.estado,
            a.vendedor_id
          FROM ofertas AS o
          INNER JOIN articulos AS a
            ON a.articulo_id =
              o.articulo_id
          WHERE o.oferta_id = ?
          FOR UPDATE
        `, [datos.ofertaId]);
        const oferta = ofertas[0];
        if (!oferta ||
            Number(oferta.comprador_id) !==
                datos.compradorId ||
            oferta.estado !== "contraoferta") {
            await conexion.rollback();
            return false;
        }
        const nuevoEstado = datos.aceptar
            ? "aceptada"
            : "rechazada";
        const [resultado] = await conexion.execute(`
          UPDATE ofertas
          SET
            estado = ?,
            fecha_respuesta =
              CURRENT_TIMESTAMP
          WHERE oferta_id = ?
            AND estado = 'contraoferta'
        `, [
            nuevoEstado,
            datos.ofertaId,
        ]);
        if (resultado.affectedRows === 0) {
            await conexion.rollback();
            return false;
        }
        if (datos.aceptar) {
            await conexion.execute(`
          UPDATE articulos
          SET estado = 'vendido'
          WHERE articulo_id = ?
        `, [oferta.articulo_id]);
            await conexion.execute(`
          UPDATE ofertas
          SET
            estado = 'rechazada',
            fecha_respuesta =
              CURRENT_TIMESTAMP
          WHERE articulo_id = ?
            AND oferta_id <> ?
            AND estado IN (
              'pendiente',
              'contraoferta'
            )
        `, [
                oferta.articulo_id,
                datos.ofertaId,
            ]);
        }
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
