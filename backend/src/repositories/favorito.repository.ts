import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

import type {
  Articulo,
} from "../models/articulo.model.js";

interface FavoritoExistenteRow
  extends RowDataPacket {
  favorito_id: number;
}

export interface ArticuloFavorito
  extends Articulo {
  favorito_id: number;
  fecha_guardado: Date;
}

export async function obtenerFavoritosPorUsuarioDesdeBaseDeDatos(
  usuarioId: number,
): Promise<ArticuloFavorito[]> {
  const [filas] =
    await pool.execute<
      ArticuloFavorito[]
    >(
      `
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
      `,
      [usuarioId],
    );

  return filas.map(
    (favorito) => ({
      ...favorito,
      archivado: Number(
        favorito.archivado ?? 0,
      ),
      imagenes: [],
    }),
  );
}

export async function buscarFavoritoDesdeBaseDeDatos(
  usuarioId: number,
  articuloId: number,
): Promise<number | null> {
  const [filas] =
    await pool.execute<
      FavoritoExistenteRow[]
    >(
      `
        SELECT
          favorito_id
        FROM favoritos
        WHERE
          usuario_id = ?
          AND articulo_id = ?
        LIMIT 1
      `,
      [
        usuarioId,
        articuloId,
      ],
    );

  return filas[0]?.favorito_id ?? null;
}

export async function crearFavoritoEnBaseDeDatos(
  usuarioId: number,
  articuloId: number,
): Promise<number> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO favoritos (
          usuario_id,
          articulo_id
        )
        VALUES (?, ?)
      `,
      [
        usuarioId,
        articuloId,
      ],
    );

  return resultado.insertId;
}

export async function eliminarFavoritoDesdeBaseDeDatos(
  usuarioId: number,
  articuloId: number,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        DELETE FROM favoritos
        WHERE
          usuario_id = ?
          AND articulo_id = ?
      `,
      [
        usuarioId,
        articuloId,
      ],
    );

  return resultado.affectedRows > 0;
}

export async function obtenerIdsFavoritosPorUsuarioDesdeBaseDeDatos(
  usuarioId: number,
): Promise<number[]> {
  interface ArticuloFavoritoIdRow
    extends RowDataPacket {
    articulo_id: number;
  }

  const [filas] =
    await pool.execute<
      ArticuloFavoritoIdRow[]
    >(
      `
        SELECT
          articulo_id
        FROM favoritos
        WHERE usuario_id = ?
        ORDER BY fecha_guardado DESC
      `,
      [usuarioId],
    );

  return filas.map(
    (fila) =>
      Number(fila.articulo_id),
  );
}