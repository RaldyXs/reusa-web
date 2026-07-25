import { pool } from "../config/database.js";

import type {
  Categoria,
} from "../models/categoria.model.js";

export async function obtenerCategoriasDesdeBaseDeDatos(): Promise<
  Categoria[]
> {
  const [filas] =
    await pool.execute<Categoria[]>(
      `
        SELECT
          categoria_id,
          nombre,
          descripcion,
          activo,
          fecha_creacion
        FROM categorias
        WHERE activo = 1
        ORDER BY nombre ASC
      `,
    );

  return filas;
}