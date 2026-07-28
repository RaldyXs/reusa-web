import type {
  RowDataPacket,
} from "mysql2";

export interface Categoria
  extends RowDataPacket {
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  activo: number;
  fecha_creacion: Date;
}