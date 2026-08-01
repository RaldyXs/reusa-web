import type {
  RowDataPacket,
} from "mysql2";

import { pool } from "../config/database.js";

export interface ContactoVendedor
  extends RowDataPacket {
  articulo_id: number;
  vendedor_id: number;
  vendedor: string;
  email: string;
  telefono: string | null;
  mostrar_contacto: number;
}

export async function obtenerContactoVendedorDesdeBaseDeDatos(
  articuloId: number,
): Promise<ContactoVendedor | null> {
  const [filas] =
    await pool.execute<
      ContactoVendedor[]
    >(
      `
        SELECT
          a.articulo_id,
          a.vendedor_id,
          CONCAT(
            u.nombre,
            ' ',
            u.apellido
          ) AS vendedor,
          u.email,
          u.telefono,
          u.mostrar_contacto
        FROM articulos AS a

        INNER JOIN usuarios AS u
          ON u.usuario_id =
            a.vendedor_id

        WHERE a.articulo_id = ?
          AND a.eliminado = 0
          AND u.activo = 1
          AND u.mostrar_contacto = 1

        LIMIT 1
      `,
      [articuloId],
    );

  return filas[0] ?? null;
}