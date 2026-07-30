import type {
  ResultSetHeader,
} from "mysql2";

import {
  pool,
} from "../config/database.js";

import type {
  CrearNotificacionDatos,
  Notificacion,
} from "../models/notificacion.model.js";

export async function crearNotificacionEnBaseDeDatos(
  datos: CrearNotificacionDatos,
): Promise<number> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO notificaciones (
          usuario_id,
          tipo,
          titulo,
          mensaje,
          enlace
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        datos.usuarioId,
        datos.tipo,
        datos.titulo,
        datos.mensaje,
        datos.enlace ?? null,
      ],
    );

  return resultado.insertId;
}

export async function obtenerNotificacionesDesdeBaseDeDatos(
  usuarioId: number,
): Promise<Notificacion[]> {
  const [filas] =
    await pool.execute<Notificacion[]>(
      `
        SELECT
          notificacion_id,
          usuario_id,
          tipo,
          titulo,
          mensaje,
          enlace,
          leida,
          fecha_creacion
        FROM notificaciones
        WHERE usuario_id = ?
        ORDER BY fecha_creacion DESC
        LIMIT 50
      `,
      [usuarioId],
    );

  return filas;
}

export async function contarNotificacionesNoLeidasEnBaseDeDatos(
  usuarioId: number,
): Promise<number> {
  const [filas] =
    await pool.execute<
      Array<
        {
          total: number;
        } & import("mysql2").RowDataPacket
      >
    >(
      `
        SELECT COUNT(*) AS total
        FROM notificaciones
        WHERE usuario_id = ?
          AND leida = 0
      `,
      [usuarioId],
    );

  return Number(
    filas[0]?.total ?? 0,
  );
}

export async function marcarNotificacionComoLeidaEnBaseDeDatos(
  notificacionId: number,
  usuarioId: number,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE notificaciones
        SET leida = 1
        WHERE notificacion_id = ?
          AND usuario_id = ?
      `,
      [
        notificacionId,
        usuarioId,
      ],
    );

  return resultado.affectedRows > 0;
}

export async function marcarTodasLasNotificacionesComoLeidasEnBaseDeDatos(
  usuarioId: number,
): Promise<number> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE notificaciones
        SET leida = 1
        WHERE usuario_id = ?
          AND leida = 0
      `,
      [usuarioId],
    );

  return resultado.affectedRows;
}