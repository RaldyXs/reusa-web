import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import {
  pool,
} from "../config/database.js";

import type {
  Conversacion,
  CrearConversacionDatos,
  CrearMensajeDatos,
  Mensaje,
} from "../models/mensaje.model.js";

interface ConversacionIdRow
  extends RowDataPacket {
  conversacion_id: number;
}

interface ConversacionControlRow
  extends RowDataPacket {
  conversacion_id: number;
  articulo_id: number;
  comprador_id: number;
  vendedor_id: number;
}

export async function buscarConversacionExistenteEnBaseDeDatos(
  articuloId: number,
  compradorId: number,
  vendedorId: number,
): Promise<number | null> {
  const [filas] =
    await pool.execute<
      ConversacionIdRow[]
    >(
      `
        SELECT conversacion_id
        FROM conversaciones
        WHERE articulo_id = ?
          AND comprador_id = ?
          AND vendedor_id = ?
        LIMIT 1
      `,
      [
        articuloId,
        compradorId,
        vendedorId,
      ],
    );

  return filas[0]?.conversacion_id ?? null;
}

export async function crearConversacionEnBaseDeDatos(
  datos: CrearConversacionDatos,
): Promise<number> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO conversaciones (
          articulo_id,
          comprador_id,
          vendedor_id
        )
        VALUES (?, ?, ?)
      `,
      [
        datos.articuloId,
        datos.compradorId,
        datos.vendedorId,
      ],
    );

  return resultado.insertId;
}

export async function obtenerConversacionPorIdEnBaseDeDatos(
  conversacionId: number,
): Promise<ConversacionControlRow | null> {
  const [filas] =
    await pool.execute<
      ConversacionControlRow[]
    >(
      `
        SELECT
          conversacion_id,
          articulo_id,
          comprador_id,
          vendedor_id
        FROM conversaciones
        WHERE conversacion_id = ?
        LIMIT 1
      `,
      [conversacionId],
    );

  return filas[0] ?? null;
}

export async function obtenerConversacionesDeUsuarioEnBaseDeDatos(
  usuarioId: number,
): Promise<Conversacion[]> {
  const [filas] =
    await pool.execute<
      Conversacion[]
    >(
      `
        SELECT
          c.conversacion_id,
          c.articulo_id,
          c.comprador_id,
          c.vendedor_id,
          c.fecha_creacion,
          c.fecha_actualizacion,

          a.titulo AS articulo_titulo,

          (
            SELECT ia.url_imagen
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
            SELECT m.contenido
            FROM mensajes AS m
            WHERE m.conversacion_id =
              c.conversacion_id
            ORDER BY
              m.fecha_envio DESC,
              m.mensaje_id DESC
            LIMIT 1
          ) AS ultimo_mensaje,

          (
            SELECT m.fecha_envio
            FROM mensajes AS m
            WHERE m.conversacion_id =
              c.conversacion_id
            ORDER BY
              m.fecha_envio DESC,
              m.mensaje_id DESC
            LIMIT 1
          ) AS fecha_ultimo_mensaje,

          (
            SELECT COUNT(*)
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
      `,
      [
        usuarioId,
        usuarioId,
        usuarioId,
        usuarioId,
        usuarioId,
      ],
    );

  return filas;
}

export async function obtenerMensajesDeConversacionEnBaseDeDatos(
  conversacionId: number,
): Promise<Mensaje[]> {
  const [filas] =
    await pool.execute<
      Mensaje[]
    >(
      `
        SELECT
          m.mensaje_id,
          m.conversacion_id,
          m.remitente_id,
          m.contenido,
          m.leido,
          m.fecha_envio,

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
      `,
      [conversacionId],
    );

  return filas;
}

export async function crearMensajeEnBaseDeDatos(
  datos: CrearMensajeDatos,
): Promise<number> {
  const conexion =
    await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [resultado] =
      await conexion.execute<ResultSetHeader>(
        `
          INSERT INTO mensajes (
            conversacion_id,
            remitente_id,
            contenido
          )
          VALUES (?, ?, ?)
        `,
        [
          datos.conversacionId,
          datos.remitenteId,
          datos.contenido,
        ],
      );

    await conexion.execute<ResultSetHeader>(
      `
        UPDATE conversaciones
        SET fecha_actualizacion =
          CURRENT_TIMESTAMP
        WHERE conversacion_id = ?
      `,
      [datos.conversacionId],
    );

    await conexion.commit();

    return resultado.insertId;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

export async function marcarMensajesComoLeidosEnBaseDeDatos(
  conversacionId: number,
  usuarioId: number,
): Promise<number> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE mensajes
        SET leido = 1
        WHERE conversacion_id = ?
          AND remitente_id <> ?
          AND leido = 0
      `,
      [
        conversacionId,
        usuarioId,
      ],
    );

  return resultado.affectedRows;
}