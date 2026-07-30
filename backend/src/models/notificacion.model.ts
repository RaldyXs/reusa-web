import type {
  RowDataPacket,
} from "mysql2";

export type TipoNotificacion =
  | "oferta_recibida"
  | "oferta_aceptada"
  | "oferta_rechazada"
  | "contraoferta_recibida"
  | "contraoferta_aceptada"
  | "contraoferta_rechazada"
  | "mensaje_nuevo"
  | "articulo_vendido";

export interface Notificacion
  extends RowDataPacket {
  notificacion_id: number;
  usuario_id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: number | boolean;
  fecha_creacion: Date | string;
}

export interface CrearNotificacionDatos {
  usuarioId: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlace?: string | null;
}