import type {
  Sesion,
} from "../interfaces/auth";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

const CLAVE_SESION = "reusa_sesion";

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

function obtenerToken(): string {
  const sesionGuardada =
    localStorage.getItem(CLAVE_SESION);

  if (!sesionGuardada) {
    throw new Error(
      "Debes iniciar sesión para realizar esta acción",
    );
  }

  try {
    const sesion =
      JSON.parse(sesionGuardada) as Sesion;

    if (!sesion.token) {
      throw new Error();
    }

    return sesion.token;
  } catch {
    throw new Error(
      "La sesión guardada no es válida",
    );
  }
}

async function solicitarOfertas<T>(
  ruta = "",
  opciones: RequestInit = {},
): Promise<T> {
  const headers = new Headers(
    opciones.headers,
  );

  headers.set(
    "Authorization",
    `Bearer ${obtenerToken()}`,
  );

  if (
    opciones.body !== undefined &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(
    `${API_URL}/ofertas${ruta}`,
    {
      ...opciones,
      headers,
    },
  );

  const datos = (await response.json()) as {
    ok: boolean;
    message?: string;
  };

  if (!response.ok || !datos.ok) {
    throw new Error(
      datos.message ??
        "No se pudo completar la solicitud",
    );
  }

  return datos as T;
}

export async function crearOferta(
  articuloId: number,
  precioOfertado: number,
  mensaje: string,
): Promise<number> {
  const respuesta =
    await solicitarOfertas<RespuestaOferta>(
      "",
      {
        method: "POST",
        body: JSON.stringify({
          articuloId,
          precioOfertado,
          mensaje,
        }),
      },
    );

  const ofertaId =
    Number(
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
    await solicitarOfertas<RespuestaOfertas>(
      "/realizadas",
    );

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
    await solicitarOfertas<RespuestaOfertas>(
      "/recibidas",
    );

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
  await solicitarOfertas<RespuestaGenerica>(
    `/${ofertaId}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({
        estado,
      }),
    },
  );
}