import {
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

import type {
  EstadisticaCategoriaAdministracion,
  EstadisticaEstadoPublicacion,
  EstadisticaMensualAdministracion,
  PublicacionAdministracion,
  ResumenAdministracion,
  UsuarioAdministracion,
} from "../models/admin.model.js";

export interface CategoriaAdministracion
  extends RowDataPacket {
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  activo: number;
  fecha_creacion: string;
}

export interface CrearCategoriaAdministracionDatos {
  nombre: string;
  descripcion: string | null;
}

export interface ActualizarCategoriaAdministracionDatos {
  nombre: string;
  descripcion: string | null;
}

export async function obtenerResumenAdministracionDesdeBaseDeDatos(): Promise<
  ResumenAdministracion
> {
  const [filas] =
    await pool.execute<
      ResumenAdministracion[]
    >(
      `
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
      `,
    );

  const resumen = filas[0];

  if (!resumen) {
    throw new Error(
      "No se pudo obtener el resumen administrativo",
    );
  }

  return resumen;
}

export async function obtenerUsuariosAdministracionDesdeBaseDeDatos(): Promise<
  UsuarioAdministracion[]
> {
  const [filas] =
    await pool.execute<
      UsuarioAdministracion[]
    >(
      `
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
      `,
    );

  return filas;
}

export async function obtenerUsuarioAdministracionPorIdDesdeBaseDeDatos(
  usuarioId: number,
): Promise<UsuarioAdministracion | null> {
  const [filas] =
    await pool.execute<
      UsuarioAdministracion[]
    >(
      `
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
      `,
      [usuarioId],
    );

  return filas[0] ?? null;
}

export async function actualizarEstadoUsuarioDesdeBaseDeDatos(
  usuarioId: number,
  activo: boolean,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE usuarios
        SET activo = ?
        WHERE usuario_id = ?
      `,
      [
        activo ? 1 : 0,
        usuarioId,
      ],
    );

  return resultado.affectedRows > 0;
}

export async function obtenerPublicacionesAdministracionDesdeBaseDeDatos(): Promise<
  PublicacionAdministracion[]
> {
  const [filas] =
    await pool.execute<
      PublicacionAdministracion[]
    >(
      `
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
      `,
    );

  return filas;
}

export async function obtenerPublicacionAdministracionPorIdDesdeBaseDeDatos(
  articuloId: number,
): Promise<PublicacionAdministracion | null> {
  const [filas] =
    await pool.execute<
      PublicacionAdministracion[]
    >(
      `
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
      `,
      [articuloId],
    );

  return filas[0] ?? null;
}

export async function actualizarEstadoPublicacionDesdeBaseDeDatos(
  articuloId: number,
  estado:
    | "activo"
    | "vendido"
    | "archivado",
): Promise<boolean> {
  const archivado =
    estado === "archivado" ? 1 : 0;

  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE articulos
        SET
          estado = ?,
          archivado = ?
        WHERE articulo_id = ?
      `,
      [
        estado,
        archivado,
        articuloId,
      ],
    );

  return resultado.affectedRows > 0;
}

export async function obtenerCategoriasAdministracionDesdeBaseDeDatos(): Promise<
  CategoriaAdministracion[]
> {
  const [filas] =
    await pool.execute<
      CategoriaAdministracion[]
    >(
      `
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
      `,
    );

  return filas;
}

export async function obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos(
  categoriaId: number,
): Promise<CategoriaAdministracion | null> {
  const [filas] =
    await pool.execute<
      CategoriaAdministracion[]
    >(
      `
        SELECT
          categoria_id,
          nombre,
          descripcion,
          activo,
          fecha_creacion
        FROM categorias
        WHERE categoria_id = ?
        LIMIT 1
      `,
      [categoriaId],
    );

  return filas[0] ?? null;
}

export async function obtenerCategoriaAdministracionPorNombreDesdeBaseDeDatos(
  nombre: string,
  excluirCategoriaId?: number,
): Promise<CategoriaAdministracion | null> {
  const parametros: Array<
    string | number
  > = [nombre];

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

  if (
    excluirCategoriaId !== undefined
  ) {
    consulta += `
      AND categoria_id <> ?
    `;

    parametros.push(excluirCategoriaId);
  }

  consulta += `
    LIMIT 1
  `;

  const [filas] =
    await pool.execute<
      CategoriaAdministracion[]
    >(
      consulta,
      parametros,
    );

  return filas[0] ?? null;
}

export async function crearCategoriaAdministracionDesdeBaseDeDatos(
  datos: CrearCategoriaAdministracionDatos,
): Promise<number> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO categorias (
          nombre,
          descripcion,
          activo
        )
        VALUES (?, ?, 1)
      `,
      [
        datos.nombre,
        datos.descripcion,
      ],
    );

  return resultado.insertId;
}

export async function actualizarCategoriaAdministracionDesdeBaseDeDatos(
  categoriaId: number,
  datos: ActualizarCategoriaAdministracionDatos,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE categorias
        SET
          nombre = ?,
          descripcion = ?
        WHERE categoria_id = ?
      `,
      [
        datos.nombre,
        datos.descripcion,
        categoriaId,
      ],
    );

  return resultado.affectedRows > 0;
}

export async function actualizarEstadoCategoriaAdministracionDesdeBaseDeDatos(
  categoriaId: number,
  activo: boolean,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE categorias
        SET activo = ?
        WHERE categoria_id = ?
      `,
      [
        activo ? 1 : 0,
        categoriaId,
      ],
    );

  return resultado.affectedRows > 0;
}

export async function obtenerUsuariosPorMesDesdeBaseDeDatos(): Promise<
  EstadisticaMensualAdministracion[]
> {
  const [filas] =
    await pool.execute<
      EstadisticaMensualAdministracion[]
    >(
      `
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
      `,
    );

  return filas;
}

export async function obtenerPublicacionesPorMesDesdeBaseDeDatos(): Promise<
  EstadisticaMensualAdministracion[]
> {
  const [filas] =
    await pool.execute<
      EstadisticaMensualAdministracion[]
    >(
      `
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
      `,
    );

  return filas;
}

export async function obtenerPublicacionesPorEstadoDesdeBaseDeDatos(): Promise<
  EstadisticaEstadoPublicacion[]
> {
  const [filas] =
    await pool.execute<
      EstadisticaEstadoPublicacion[]
    >(
      `
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
      `,
    );

  return filas;
}

export async function obtenerPublicacionesPorCategoriaDesdeBaseDeDatos(): Promise<
  EstadisticaCategoriaAdministracion[]
> {
  const [filas] =
    await pool.execute<
      EstadisticaCategoriaAdministracion[]
    >(
      `
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
      `,
    );

  return filas;
}