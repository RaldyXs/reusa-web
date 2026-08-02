import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

export interface PerfilUsuario
  extends RowDataPacket {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  ubicacion: string | null;
  rol: "usuario" | "administrador";
  activo: number;
  fecha_registro: Date;
  mostrar_contacto: number;
}

interface ContrasenaUsuarioRow
  extends RowDataPacket {
  contrasena: string;
}

export interface ActualizarPerfilDatos {
  nombre: string;
  apellido: string;
  telefono: string | null;
  ubicacion: string | null;
  mostrarContacto: boolean;
}

export async function obtenerPerfilUsuarioDesdeBaseDeDatos(
  usuarioId: number,
): Promise<PerfilUsuario | null> {
  const [filas] =
    await pool.execute<
      PerfilUsuario[]
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
          fecha_registro,
          mostrar_contacto
        FROM usuarios
        WHERE usuario_id = ?
        LIMIT 1
      `,
      [usuarioId],
    );

  return filas[0] ?? null;
}

export async function obtenerContrasenaUsuarioDesdeBaseDeDatos(
  usuarioId: number,
): Promise<string | null> {
  const [filas] =
    await pool.execute<
      ContrasenaUsuarioRow[]
    >(
      `
        SELECT
          contrasena
        FROM usuarios
        WHERE usuario_id = ?
        LIMIT 1
      `,
      [usuarioId],
    );

  return filas[0]?.contrasena ?? null;
}

export async function actualizarPerfilUsuarioEnBaseDeDatos(
  usuarioId: number,
  datos: ActualizarPerfilDatos,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE usuarios
        SET
          nombre = ?,
          apellido = ?,
          telefono = ?,
          ubicacion = ?,
          mostrar_contacto = ?
        WHERE usuario_id = ?
      `,
      [
        datos.nombre,
        datos.apellido,
        datos.telefono,
        datos.ubicacion,
        datos.mostrarContacto
          ? 1
          : 0,
        usuarioId,
      ],
    );

  return resultado.affectedRows > 0;
}

export async function actualizarContrasenaUsuarioEnBaseDeDatos(
  usuarioId: number,
  nuevaContrasenaHash: string,
): Promise<boolean> {
  const [resultado] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE usuarios
        SET
          contrasena = ?
        WHERE usuario_id = ?
      `,
      [
        nuevaContrasenaHash,
        usuarioId,
      ],
    );

  return resultado.affectedRows > 0;
}