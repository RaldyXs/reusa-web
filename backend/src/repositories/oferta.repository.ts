import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

import type {
  CrearOfertaDatos,
  EstadoOferta,
  Oferta,
} from "../models/oferta.model.js";

interface OfertaIdRow extends RowDataPacket {
  oferta_id: number;
}

interface OfertaPropietarioRow
  extends RowDataPacket {
  oferta_id: number;
  articulo_id: number;
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
          AND estado = 'pendiente'
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
          o.mensaje,
          o.estado,
          o.fecha_oferta,

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
            WHERE ia.articulo_id = a.articulo_id
            ORDER BY
              ia.es_principal DESC,
              ia.orden ASC,
              ia.imagen_id ASC
            LIMIT 1
          ) AS imagen_principal

        FROM ofertas AS o

        INNER JOIN articulos AS a
          ON a.articulo_id = o.articulo_id

        INNER JOIN usuarios AS vendedor
          ON vendedor.usuario_id = a.vendedor_id

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
          o.mensaje,
          o.estado,
          o.fecha_oferta,

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
            WHERE ia.articulo_id = a.articulo_id
            ORDER BY
              ia.es_principal DESC,
              ia.orden ASC,
              ia.imagen_id ASC
            LIMIT 1
          ) AS imagen_principal

        FROM ofertas AS o

        INNER JOIN articulos AS a
          ON a.articulo_id = o.articulo_id

        INNER JOIN usuarios AS comprador
          ON comprador.usuario_id = o.comprador_id

        WHERE a.vendedor_id = ?

        ORDER BY
          FIELD(
            o.estado,
            'pendiente',
            'aceptada',
            'contraoferta',
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
): Promise<OfertaPropietarioRow | null> {
  const [filas] =
    await pool.execute<
      OfertaPropietarioRow[]
    >(
      `
        SELECT
          o.oferta_id,
          o.articulo_id,
          o.estado,
          a.vendedor_id
        FROM ofertas AS o
        INNER JOIN articulos AS a
          ON a.articulo_id = o.articulo_id
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
        OfertaPropietarioRow[]
      >(
        `
          SELECT
            o.oferta_id,
            o.articulo_id,
            o.estado,
            a.vendedor_id
          FROM ofertas AS o
          INNER JOIN articulos AS a
            ON a.articulo_id = o.articulo_id
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
          SET estado = ?
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
          SET estado = 'rechazada'
          WHERE articulo_id = ?
            AND oferta_id <> ?
            AND estado = 'pendiente'
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