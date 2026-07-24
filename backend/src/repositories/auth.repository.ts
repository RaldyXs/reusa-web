import { pool } from "../config/database.js";
import type { UsuarioAutenticacion } from "../models/auth.model.js";

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