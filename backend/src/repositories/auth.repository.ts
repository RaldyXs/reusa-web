import type { ResultSetHeader } from "mysql2";

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
  rol: Exclude<RolUsuario, "administrador">;
}

export async function buscarUsuarioPorEmail(
  email: string,
): Promise<UsuarioAutenticacion | null> {
  const [filas] =
    await pool.execute<UsuarioAutenticacion[]>(
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