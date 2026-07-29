import {
  solicitarApi,
} from "./apiService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

const API_URL =
  `${API_BASE_URL}/ofertas`;

export type EstadoOferta =
  | "pendiente"
  | "aceptada"
  | "rechazada"
  | "contraoferta";

export interface Oferta {
  oferta_id: number;
  comprador_id: number;
  articulo_id: number;
  precio_ofertado: number | string;
  mensaje: string | null;
  estado: EstadoOferta;
  fecha_oferta: string;

  articulo_titulo?: string;
  articulo_precio?: number | string;
  articulo_estado?: string;

  imagen_principal?: string | null;

  comprador_nombre?: string;
  comprador_email?: string;

  vendedor_id?: number;
  vendedor_nombre?: string;
}

interface RespuestaOferta {
  ok: boolean;
  message?: string;
  oferta?: {
    ofertaId: number;
  };
}

interface RespuestaOfertas {
  ok: boolean;
  message?: string;
  ofertas?: Oferta[];
}

interface RespuestaGenerica {
  ok: boolean;
  message?: string;
}

export async function crearOferta(
  articuloId: number,
  precioOfertado: number,
  mensaje: string,
): Promise<number> {
  const respuesta =
    await solicitarApi<RespuestaOferta>(
      API_URL,
      {
        method: "POST",
        body: JSON.stringify({
          articuloId,
          precioOfertado,
          mensaje,
        }),
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudo registrar la oferta",
    );
  }

  const ofertaId = Number(
    respuesta.oferta?.ofertaId,
  );

  if (
    !Number.isInteger(ofertaId) ||
    ofertaId <= 0
  ) {
    throw new Error(
      "El servidor no devolvió una oferta válida",
    );
  }

  return ofertaId;
}

export async function obtenerOfertasRealizadas(): Promise<
  Oferta[]
> {
  const respuesta =
    await solicitarApi<RespuestaOfertas>(
      `${API_URL}/realizadas`,
      {
        method: "GET",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudieron obtener las ofertas realizadas",
    );
  }

  return Array.isArray(
    respuesta.ofertas,
  )
    ? respuesta.ofertas
    : [];
}

export async function obtenerOfertasRecibidas(): Promise<
  Oferta[]
> {
  const respuesta =
    await solicitarApi<RespuestaOfertas>(
      `${API_URL}/recibidas`,
      {
        method: "GET",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudieron obtener las ofertas recibidas",
    );
  }

  return Array.isArray(
    respuesta.ofertas,
  )
    ? respuesta.ofertas
    : [];
}

export async function responderOferta(
  ofertaId: number,
  estado: "aceptada" | "rechazada",
): Promise<void> {
  const respuesta =
    await solicitarApi<RespuestaGenerica>(
      `${API_URL}/${ofertaId}/estado`,
      {
        method: "PATCH",
        body: JSON.stringify({
          estado,
        }),
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudo responder la oferta",
    );
  }
}