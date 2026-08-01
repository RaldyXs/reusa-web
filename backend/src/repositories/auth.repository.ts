import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

import type {
  RolUsuario,
  UsuarioAutenticacion,
} from "../models/auth.model.js";

interface CrearUsuarioDatos {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  telefono: string;
  ubicacion: string;
  rol: Exclude<
    RolUsuario,
    "administrador"
  >;
}

export interface UsuarioRecuperacion
  extends RowDataPacket {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: number;
  token_recuperacion_expira:
    string | null;
}

export async function buscarUsuarioPorEmail(
  email: string,
): Promise<UsuarioAutenticacion | null> {
  const [filas] =
    await pool.execute<
      UsuarioAutenticacion[]
    >(
      `
        SELECT
          usuario_id,
          nombre,
          apellido,
          email,
          contrasena,
          telefono,
          ubicacion,
          rol,
          activo
        FROM usuarios
        WHERE email = ?
        LIMIT 1
      `,
      [email],
    );

  return filas[0] ?? null;
}

export async function crearUsuarioEnBaseDeDatos(
  datos: CrearUsuarioDatos,
): Promise<number> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO usuarios (
          nombre,
          apellido,
          email,
          contrasena,
          telefono,
          ubicacion,
          rol,
          activo
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          1
        )
      `,
      [
        datos.nombre,
        datos.apellido,
        datos.email,
        datos.contrasena,
        datos.telefono,
        datos.ubicacion,
        datos.rol,
      ],
    );

  return resultado.insertId;
}

export async function guardarTokenRecuperacion(
  usuarioId: number,
  tokenHash: string,
  fechaExpiracion: Date,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE usuarios
        SET
          token_recuperacion_hash = ?,
          token_recuperacion_expira = ?
        WHERE usuario_id = ?
          AND activo = 1
      `,
      [
        tokenHash,
        fechaExpiracion,
        usuarioId,
      ],
    );

  return resultado.affectedRows > 0;
}

export async function buscarUsuarioPorTokenRecuperacion(
  tokenHash: string,
): Promise<UsuarioRecuperacion | null> {
  const [filas] =
    await pool.execute<
      UsuarioRecuperacion[]
    >(
      `
        SELECT
          usuario_id,
          nombre,
          apellido,
          email,
          activo,
          token_recuperacion_expira
        FROM usuarios
        WHERE token_recuperacion_hash = ?
          AND token_recuperacion_expira IS NOT NULL
          AND token_recuperacion_expira > NOW()
          AND activo = 1
        LIMIT 1
      `,
      [tokenHash],
    );

  return filas[0] ?? null;
}

export async function actualizarContrasenaUsuario(
  usuarioId: number,
  contrasenaCifrada: string,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE usuarios
        SET contrasena = ?
        WHERE usuario_id = ?
          AND activo = 1
      `,
      [
        contrasenaCifrada,
        usuarioId,
      ],
    );

  return resultado.affectedRows > 0;
}

export async function invalidarTokenRecuperacion(
  usuarioId: number,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE usuarios
        SET
          token_recuperacion_hash = NULL,
          token_recuperacion_expira = NULL
        WHERE usuario_id = ?
      `,
      [usuarioId],
    );

  return resultado.affectedRows > 0;
}