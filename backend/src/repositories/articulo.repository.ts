import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";
import type {
  Articulo,
  CrearArticuloDatos,
} from "../models/articulo.model.js";

type ResultadoStoredProcedure = [
  Articulo[],
  ResultSetHeader,
];

interface ArticuloIdRow extends RowDataPacket {
  articulo_id: number;
}

interface ImagenArticuloRow extends RowDataPacket {
  url_imagen: string;
}

interface CantidadImagenesRow extends RowDataPacket {
  cantidad: number;
}

export interface ActualizarArticuloDatos {
  titulo: string;
  descripcion: string;
  precio: number;
  condicion: "nuevo" | "reparado" | "usado";
  ubicacion: string;
  categoriaId: number;
}

export type EstadoArticulo =
  | "activo"
  | "vendido"
  | "archivado";

export interface NuevaImagenArticulo {
  urlImagen: string;
  esPrincipal: boolean;
  orden: number;
}

export async function buscarArticulosEnBaseDeDatos(
  termino: string,
  categoriaId: number | null,
): Promise<Articulo[]> {
  const [resultado] =
    await pool.query<ResultadoStoredProcedure>(
      "CALL sp_buscar_articulos(?, ?)",
      [termino, categoriaId],
    );

  return resultado[0];
}

export async function obtenerArticuloPorIdEnBaseDeDatos(
  articuloId: number,
): Promise<Articulo | null> {
  const [filas] = await pool.execute<Articulo[]>(
    `
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
        a.fecha_publicacion,
        c.nombre AS categoria,
        CONCAT(u.nombre, ' ', u.apellido) AS vendedor,
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
    `,
    [articuloId],
  );

  const articulo = filas[0];

  if (!articulo) {
    return null;
  }

  const [filasImagenes] =
    await pool.execute<ImagenArticuloRow[]>(
      `
        SELECT url_imagen
        FROM imagenes_articulos
        WHERE articulo_id = ?
        ORDER BY
          es_principal DESC,
          orden ASC,
          imagen_id ASC
      `,
      [articuloId],
    );

  return {
    ...articulo,
    imagenes: filasImagenes.map(
      (imagen) => imagen.url_imagen,
    ),
  };
}

export async function crearArticuloEnBaseDeDatos(
  datos: CrearArticuloDatos,
): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `
      INSERT INTO articulos (
        vendedor_id,
        categoria_id,
        titulo,
        descripcion,
        precio,
        condicion,
        ubicacion,
        estado
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')
    `,
    [
      datos.vendedorId,
      datos.categoriaId,
      datos.titulo,
      datos.descripcion,
      datos.precio,
      datos.condicion,
      datos.ubicacion,
    ],
  );

  return resultado.insertId;
}

export async function actualizarArticuloEnBaseDeDatos(
  articuloId: number,
  datos: ActualizarArticuloDatos,
): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `
      UPDATE articulos
      SET
        categoria_id = ?,
        titulo = ?,
        descripcion = ?,
        precio = ?,
        condicion = ?,
        ubicacion = ?
      WHERE articulo_id = ?
    `,
    [
      datos.categoriaId,
      datos.titulo,
      datos.descripcion,
      datos.precio,
      datos.condicion,
      datos.ubicacion,
      articuloId,
    ],
  );

  return resultado.affectedRows > 0;
}

export async function actualizarEstadoArticuloEnBaseDeDatos(
  articuloId: number,
  estado: EstadoArticulo,
): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `
      UPDATE articulos
      SET estado = ?
      WHERE articulo_id = ?
    `,
    [estado, articuloId],
  );

  return resultado.affectedRows > 0;
}

export async function existeArticuloPorId(
  articuloId: number,
): Promise<boolean> {
  const [filas] = await pool.execute<ArticuloIdRow[]>(
    `
      SELECT articulo_id
      FROM articulos
      WHERE articulo_id = ?
      LIMIT 1
    `,
    [articuloId],
  );

  return filas.length > 0;
}

export async function contarImagenesArticulo(
  articuloId: number,
): Promise<number> {
  const [filas] =
    await pool.execute<CantidadImagenesRow[]>(
      `
        SELECT COUNT(*) AS cantidad
        FROM imagenes_articulos
        WHERE articulo_id = ?
      `,
      [articuloId],
    );

  return Number(filas[0]?.cantidad ?? 0);
}

export async function guardarImagenesArticuloEnBaseDeDatos(
  articuloId: number,
  imagenes: NuevaImagenArticulo[],
): Promise<void> {
  if (imagenes.length === 0) {
    return;
  }

  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    for (const imagen of imagenes) {
      await conexion.execute<ResultSetHeader>(
        `
          INSERT INTO imagenes_articulos (
            articulo_id,
            url_imagen,
            es_principal,
            orden
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          articuloId,
          imagen.urlImagen,
          imagen.esPrincipal ? 1 : 0,
          imagen.orden,
        ],
      );
    }

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

interface ImagenGuardadaRow extends RowDataPacket {
  imagen_id: number;
  es_principal: number;
}

export async function eliminarImagenArticuloEnBaseDeDatos(
  articuloId: number,
  urlImagen: string,
): Promise<boolean> {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [imagenes] =
      await conexion.execute<ImagenGuardadaRow[]>(
        `
          SELECT
            imagen_id,
            es_principal
          FROM imagenes_articulos
          WHERE articulo_id = ?
            AND url_imagen = ?
          LIMIT 1
        `,
        [articuloId, urlImagen],
      );

    const imagen = imagenes[0];

    if (!imagen) {
      await conexion.rollback();
      return false;
    }

    await conexion.execute<ResultSetHeader>(
      `
        DELETE FROM imagenes_articulos
        WHERE imagen_id = ?
      `,
      [imagen.imagen_id],
    );

    if (Number(imagen.es_principal) === 1) {
      const [restantes] =
        await conexion.execute<ImagenGuardadaRow[]>(
          `
            SELECT
              imagen_id,
              es_principal
            FROM imagenes_articulos
            WHERE articulo_id = ?
            ORDER BY
              orden ASC,
              imagen_id ASC
            LIMIT 1
          `,
          [articuloId],
        );

      const nuevaPrincipal = restantes[0];

      if (nuevaPrincipal) {
        await conexion.execute<ResultSetHeader>(
          `
            UPDATE imagenes_articulos
            SET es_principal = 1
            WHERE imagen_id = ?
          `,
          [nuevaPrincipal.imagen_id],
        );
      }
    }

    await conexion.execute<ResultSetHeader>(
      `
        UPDATE imagenes_articulos
        SET orden = orden - 1
        WHERE articulo_id = ?
          AND orden > (
            SELECT orden_eliminado
            FROM (
              SELECT COALESCE(MAX(orden), 0) AS orden_eliminado
              FROM imagenes_articulos
              WHERE articulo_id = ?
            ) AS resultado
          )
      `,
      [articuloId, articuloId],
    );

    await conexion.commit();
    return true;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}