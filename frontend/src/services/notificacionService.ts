import {
  solicitarApi,
} from "./apiService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (
    import.meta.env.PROD
      ? "https://reusa-backend.onrender.com/api"
      : "http://localhost:3000/api"
  );

const API_URL =
  `${API_BASE_URL}/notificaciones`;

export type TipoNotificacion =
  | "oferta_recibida"
  | "oferta_aceptada"
  | "oferta_rechazada"
  | "contraoferta_recibida"
  | "contraoferta_aceptada"
  | "contraoferta_rechazada"
  | "mensaje_nuevo"
  | "articulo_vendido";

export interface Notificacion {
  notificacion_id: number;
  usuario_id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: number | boolean;
  fecha_creacion: string;
}

interface RespuestaNotificaciones {
  ok: boolean;
  message?: string;
  notificaciones?: Notificacion[];
}

interface RespuestaResumen {
  ok: boolean;
  message?: string;
  noLeidas?: number;
}

interface RespuestaGenerica {
  ok: boolean;
  message?: string;
  actualizadas?: number;
}

export async function obtenerNotificaciones(): Promise<
  Notificacion[]
> {
  const respuesta =
    await solicitarApi<RespuestaNotificaciones>(
      API_URL,
      {
        method: "GET",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudieron obtener las notificaciones",
    );
  }

  return Array.isArray(
    respuesta.notificaciones,
  )
    ? respuesta.notificaciones
    : [];
}

export async function obtenerCantidadNoLeidas(): Promise<number> {
  const respuesta =
    await solicitarApi<RespuestaResumen>(
      `${API_URL}/resumen`,
      {
        method: "GET",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudo obtener el resumen de notificaciones",
    );
  }

  return Number(
    respuesta.noLeidas ?? 0,
  );
}

export async function marcarNotificacionComoLeida(
  notificacionId: number,
): Promise<void> {
  const respuesta =
    await solicitarApi<RespuestaGenerica>(
      `${API_URL}/${notificacionId}/leida`,
      {
        method: "PATCH",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudo marcar la notificación como leída",
    );
  }
}

export async function marcarTodasComoLeidas(): Promise<number> {
  const respuesta =
    await solicitarApi<RespuestaGenerica>(
      `${API_URL}/marcar-todas/leidas`,
      {
        method: "PATCH",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudieron marcar las notificaciones como leídas",
    );
  }

  return Number(
    respuesta.actualizadas ?? 0,
  );
}