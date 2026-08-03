import type {
  Articulo,
} from "../interfaces/articulo";

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
  `${API_BASE_URL}/favoritos`;

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

export async function obtenerFavoritos(): Promise<
  ArticuloFavorito[]
> {
  const respuesta =
    await solicitarApi<RespuestaFavoritos>(
      API_URL,
      {
        method: "GET",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudieron obtener los favoritos",
    );
  }

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
    await solicitarApi<RespuestaIdsFavoritos>(
      `${API_URL}/ids`,
      {
        method: "GET",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudieron obtener los favoritos",
    );
  }

  return Array.isArray(
    respuesta.favoritos,
  )
    ? respuesta.favoritos
        .map(Number)
        .filter(
          (articuloId) =>
            Number.isInteger(
              articuloId,
            ) &&
            articuloId > 0,
        )
    : [];
}

export async function guardarFavorito(
  articuloId: number,
): Promise<void> {
  const respuesta =
    await solicitarApi<RespuestaGuardarFavorito>(
      `${API_URL}/${articuloId}`,
      {
        method: "POST",
      },
      true,
    );

  if (
    !respuesta.ok ||
    !respuesta.favorito
  ) {
    throw new Error(
      respuesta.message ??
        "No se pudo guardar el artículo",
    );
  }
}

export async function quitarFavorito(
  articuloId: number,
): Promise<void> {
  const respuesta =
    await solicitarApi<RespuestaGenerica>(
      `${API_URL}/${articuloId}`,
      {
        method: "DELETE",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudo quitar el artículo de guardados",
    );
  }
}