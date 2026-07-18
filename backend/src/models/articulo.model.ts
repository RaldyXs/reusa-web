import type { RowDataPacket } from "mysql2";

export interface Articulo extends RowDataPacket {
  articulo_id: number;
  titulo: string;
  descripcion: string | null;
  precio: string;
  condicion: "nuevo" | "reparado" | "usado";
  ubicacion: string | null;
  estado: "activo" | "vendido" | "archivado";
  fecha_publicacion: Date;

  categoria_id: number;
  categoria: string;

  vendedor_id: number;
  vendedor: string;

  imagen_principal: string | null;
}