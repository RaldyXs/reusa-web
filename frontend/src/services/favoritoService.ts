import type {
  Articulo,
} from "../interfaces/articulo";

import type {
  Sesion,
} from "../interfaces/auth";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

const CLAVE_SESION = "reusa_sesion";

export interface ArticuloFavorito
  extends Articulo {
  favorito_id: number;
  fecha_guardado: string;
}

interface RespuestaFavoritos {
  ok: boolean;
  favoritos?: ArticuloFavorito[];
  message?: string;
}

interface RespuestaIdsFavoritos {
  ok: boolean;
  favoritos?: number[];
  message?: string;
}

interface RespuestaGuardarFavorito {
  ok: boolean;
  message?: string;
  favorito?: {
    favoritoId: number;
    articuloId: number;
  };
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
      "Debes iniciar sesión para usar favoritos",
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

async function solicitarFavoritos<T>(
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
    `${API_URL}/favoritos${ruta}`,
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
        "No se pudo completar la solicitud de favoritos",
    );
  }

  return datos as T;
}

export async function obtenerFavoritos(): Promise<
  ArticuloFavorito[]
> {
  const respuesta =
    await solicitarFavoritos<RespuestaFavoritos>();

  return Array.isArray(
    respuesta.favoritos,
  )
    ? respuesta.favoritos
    : [];
}

export async function obtenerIdsFavoritos(): Promise<
  number[]
> {
  const respuesta =
    await solicitarFavoritos<RespuestaIdsFavoritos>(
      "/ids",
    );

  return Array.isArray(
    respuesta.favoritos,
  )
    ? respuesta.favoritos.map(Number)
    : [];
}

export async function guardarFavorito(
  articuloId: number,
): Promise<void> {
  const respuesta =
    await solicitarFavoritos<RespuestaGuardarFavorito>(
      `/${articuloId}`,
      {
        method: "POST",
      },
    );

  if (!respuesta.favorito) {
    throw new Error(
      "El servidor no devolvió el favorito creado",
    );
  }
}

export async function quitarFavorito(
  articuloId: number,
): Promise<void> {
  await solicitarFavoritos<RespuestaGenerica>(
    `/${articuloId}`,
    {
      method: "DELETE",
    },
  );
}