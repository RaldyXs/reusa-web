import {
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

import type {
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