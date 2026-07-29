import type {
  RowDataPacket,
} from "mysql2";

export type EstadoOferta =
  | "pendiente"
  | "aceptada"
  | "rechazada"
  | "contraoferta";

export interface Oferta
  extends RowDataPacket {
  oferta_id: number;
  comprador_id: number;
  articulo_id: number;
  precio_ofertado: string | number;
  mensaje: string | null;
  estado: EstadoOferta;
  fecha_oferta: Date;

  articulo_titulo?: string;
  articulo_precio?: string | number;
  imagen_principal?: string | null;

  comprador_nombre?: string;
  comprador_email?: string;

  vendedor_id?: number;
  vendedor_nombre?: string;
}

export interface CrearOfertaDatos {
  compradorId: number;
  articuloId: number;
  precioOfertado: number;
  mensaje: string | null;
}

export interface ActualizarEstadoOfertaDatos {
  ofertaId: number;
  vendedorId: number;
  estado: Extract<
    EstadoOferta,
    "aceptada" | "rechazada"
  >;
}