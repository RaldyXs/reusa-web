import type {
  RowDataPacket,
} from "mysql2";

export interface Conversacion
  extends RowDataPacket {
  conversacion_id: number;
  articulo_id: number;
  comprador_id: number;
  vendedor_id: number;
  fecha_creacion: Date | string;
  fecha_actualizacion: Date | string;

  articulo_titulo?: string;
  imagen_principal?: string | null;

  comprador_nombre?: string;
  vendedor_nombre?: string;

  otro_usuario_id?: number;
  otro_usuario_nombre?: string;

  ultimo_mensaje?: string | null;
  fecha_ultimo_mensaje?: Date | string | null;
  mensajes_no_leidos?: number;
}

export interface Mensaje
  extends RowDataPacket {
  mensaje_id: number;
  conversacion_id: number;
  remitente_id: number;
  contenido: string;
  leido: number | boolean;
  fecha_envio: Date | string;

  remitente_nombre?: string;
}

export interface CrearConversacionDatos {
  articuloId: number;
  compradorId: number;
  vendedorId: number;
}

export interface CrearMensajeDatos {
  conversacionId: number;
  remitenteId: number;
  contenido: string;
}