import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

import type {
  CrearContraofertaDatos,
  CrearOfertaDatos,
  EstadoOferta,
  Oferta,
  ResponderContraofertaDatos,
} from "../models/oferta.model.js";

interface OfertaIdRow extends RowDataPacket {
  oferta_id: number;
}

interface OfertaControlRow
  extends RowDataPacket {
  oferta_id: number;
  articulo_id: number;
  comprador_id: number;
  vendedor_id: number;
  estado: EstadoOferta;
}

export async function crearOfertaEnBaseDeDatos(
  datos: CrearOfertaDatos,
): Promise<number> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO ofertas (
          comprador_id,
          articulo_id,
          precio_ofertado,
          mensaje,
          estado
        )
        VALUES (?, ?, ?, ?, 'pendiente')
      `,
      [
        datos.compradorId,
        datos.articuloId,
        datos.precioOfertado,
        datos.mensaje,
      ],
    );

  return resultado.insertId;
}

export async function buscarOfertaPendienteEnBaseDeDatos(
  compradorId: number,
  articuloId: number,
): Promise<number | null> {
  const [filas] =
    await pool.execute<OfertaIdRow[]>(
      `
        SELECT oferta_id
        FROM ofertas
        WHERE comprador_id = ?
          AND articulo_id = ?
          AND estado IN (
            'pendiente',
            'contraoferta'
          )
        LIMIT 1
      `,
      [
        compradorId,
        articuloId,
      ],
    );

  return filas[0]?.oferta_id ?? null;
}

export async function obtenerOfertasRealizadasDesdeBaseDeDatos(
  compradorId: number,
): Promise<Oferta[]> {
  const [filas] =
    await pool.execute<Oferta[]>(
      `
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
      `,
      [compradorId],
    );

  return filas;
}

export async function obtenerOfertasRecibidasDesdeBaseDeDatos(
  vendedorId: number,
): Promise<Oferta[]> {
  const [filas] =
    await pool.execute<Oferta[]>(
      `
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
      `,
      [vendedorId],
    );

  return filas;
}

export async function obtenerOfertaPorIdDesdeBaseDeDatos(
  ofertaId: number,
): Promise<OfertaControlRow | null> {
  const [filas] =
    await pool.execute<
      OfertaControlRow[]
    >(
      `
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
      `,
      [ofertaId],
    );

  return filas[0] ?? null;
}

export async function actualizarEstadoOfertaEnBaseDeDatos(
  ofertaId: number,
  vendedorId: number,
  estado: Extract<
    EstadoOferta,
    "aceptada" | "rechazada"
  >,
): Promise<boolean> {
  const conexion =
    await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [ofertas] =
      await conexion.execute<
        OfertaControlRow[]
      >(
        `
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
        `,
        [ofertaId],
      );

    const oferta = ofertas[0];

    if (
      !oferta ||
      Number(oferta.vendedor_id) !==
        vendedorId ||
      oferta.estado !== "pendiente"
    ) {
      await conexion.rollback();

      return false;
    }

    const [resultado] =
      await conexion.execute<ResultSetHeader>(
        `
          UPDATE ofertas
          SET
            estado = ?,
            fecha_respuesta =
              CURRENT_TIMESTAMP
          WHERE oferta_id = ?
            AND estado = 'pendiente'
        `,
        [
          estado,
          ofertaId,
        ],
      );

    if (resultado.affectedRows === 0) {
      await conexion.rollback();

      return false;
    }

    if (estado === "aceptada") {
      await conexion.execute<ResultSetHeader>(
        `
          UPDATE articulos
          SET estado = 'vendido'
          WHERE articulo_id = ?
        `,
        [oferta.articulo_id],
      );

      await conexion.execute<ResultSetHeader>(
        `
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
        `,
        [
          oferta.articulo_id,
          ofertaId,
        ],
      );
    }

    await conexion.commit();

    return true;
  } catch (error) {
    await conexion.rollback();

    throw error;
  } finally {
    conexion.release();
  }
}

export async function crearContraofertaEnBaseDeDatos(
  datos: CrearContraofertaDatos,
): Promise<boolean> {
  const conexion =
    await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [ofertas] =
      await conexion.execute<
        OfertaControlRow[]
      >(
        `
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
        `,
        [datos.ofertaId],
      );

    const oferta = ofertas[0];

    if (
      !oferta ||
      Number(oferta.vendedor_id) !==
        datos.vendedorId ||
      oferta.estado !== "pendiente"
    ) {
      await conexion.rollback();

      return false;
    }

    const [resultado] =
      await conexion.execute<ResultSetHeader>(
        `
          UPDATE ofertas
          SET
            precio_contraoferta = ?,
            mensaje_contraoferta = ?,
            estado = 'contraoferta',
            fecha_respuesta =
              CURRENT_TIMESTAMP
          WHERE oferta_id = ?
            AND estado = 'pendiente'
        `,
        [
          datos.precioContraoferta,
          datos.mensajeContraoferta,
          datos.ofertaId,
        ],
      );

    if (resultado.affectedRows === 0) {
      await conexion.rollback();

      return false;
    }

    await conexion.commit();

    return true;
  } catch (error) {
    await conexion.rollback();

    throw error;
  } finally {
    conexion.release();
  }
}

export async function responderContraofertaEnBaseDeDatos(
  datos: ResponderContraofertaDatos,
): Promise<boolean> {
  const conexion =
    await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [ofertas] =
      await conexion.execute<
        OfertaControlRow[]
      >(
        `
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
        `,
        [datos.ofertaId],
      );

    const oferta = ofertas[0];

    if (
      !oferta ||
      Number(oferta.comprador_id) !==
        datos.compradorId ||
      oferta.estado !== "contraoferta"
    ) {
      await conexion.rollback();

      return false;
    }

    const nuevoEstado: Extract<
      EstadoOferta,
      "aceptada" | "rechazada"
    > = datos.aceptar
      ? "aceptada"
      : "rechazada";

    const [resultado] =
      await conexion.execute<ResultSetHeader>(
        `
          UPDATE ofertas
          SET
            estado = ?,
            fecha_respuesta =
              CURRENT_TIMESTAMP
          WHERE oferta_id = ?
            AND estado = 'contraoferta'
        `,
        [
          nuevoEstado,
          datos.ofertaId,
        ],
      );

    if (resultado.affectedRows === 0) {
      await conexion.rollback();

      return false;
    }

    if (datos.aceptar) {
      await conexion.execute<ResultSetHeader>(
        `
          UPDATE articulos
          SET estado = 'vendido'
          WHERE articulo_id = ?
        `,
        [oferta.articulo_id],
      );

      await conexion.execute<ResultSetHeader>(
        `
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
        `,
        [
          oferta.articulo_id,
          datos.ofertaId,
        ],
      );
    }

    await conexion.commit();

    return true;
  } catch (error) {
    await conexion.rollback();

    throw error;
  } finally {
    conexion.release();
  }
}