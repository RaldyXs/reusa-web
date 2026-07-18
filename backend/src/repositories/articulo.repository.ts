import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/database.js";
import type { Articulo } from "../models/articulo.model.js";

type ResultadoStoredProcedure = [
  Articulo[],
  ResultSetHeader,
];

export async function buscarArticulosEnBaseDeDatos(
  termino: string,
  categoriaId: number | null,
): Promise<Articulo[]> {
  const [resultado] = await pool.query<ResultadoStoredProcedure>(
    "CALL sp_buscar_articulos(?, ?)",
    [termino, categoriaId],
  );

  return resultado[0];
}