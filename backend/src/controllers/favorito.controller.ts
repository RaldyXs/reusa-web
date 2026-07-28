import type {
  Request,
  Response,
} from "express";

import {
  guardarArticuloFavorito,
  obtenerFavoritosUsuario,
  obtenerIdsFavoritosUsuario,
  quitarArticuloFavorito,
} from "../services/favorito.service.js";

interface UsuarioAutenticado {
  usuarioId?: unknown;
}

interface RequestAutenticado
  extends Request {
  usuario?: UsuarioAutenticado;
}

function obtenerUsuarioId(
  request: RequestAutenticado,
): number {
  const usuarioId = Number(
    request.usuario?.usuarioId,
  );

  if (
    !Number.isInteger(usuarioId) ||
    usuarioId <= 0
  ) {
    throw new Error(
      "No se pudo identificar al usuario",
    );
  }

  return usuarioId;
}

function obtenerArticuloId(
  request: Request,
): number {
  const articuloId = Number(
    request.params.articuloId,
  );

  if (
    !Number.isInteger(articuloId) ||
    articuloId <= 0
  ) {
    throw new Error(
      "El identificador del artículo no es válido",
    );
  }

  return articuloId;
}

function obtenerCodigoEstado(
  mensaje: string,
): number {
  if (
    mensaje.includes(
      "No se pudo identificar",
    )
  ) {
    return 401;
  }

  if (
    mensaje.includes("no existe")
  ) {
    return 404;
  }

  if (
    mensaje.includes(
      "no estaba guardado",
    )
  ) {
    return 404;
  }

  if (
    mensaje.includes("no es válido") ||
    mensaje.includes(
      "publicación archivada",
    )
  ) {
    return 400;
  }

  return 500;
}

export async function obtenerFavoritos(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const favoritos =
      await obtenerFavoritosUsuario(
        usuarioId,
      );

    response.status(200).json({
      ok: true,
      favoritos,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudieron obtener los favoritos";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al obtener favoritos:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function obtenerIdsFavoritos(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const favoritos =
      await obtenerIdsFavoritosUsuario(
        usuarioId,
      );

    response.status(200).json({
      ok: true,
      favoritos,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudieron obtener los favoritos";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al obtener IDs de favoritos:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function guardarFavorito(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const articuloId =
      obtenerArticuloId(request);

    const favorito =
      await guardarArticuloFavorito(
        usuarioId,
        articuloId,
      );

    response.status(201).json({
      ok: true,
      message:
        "Artículo guardado correctamente",
      favorito,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo guardar el artículo";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al guardar favorito:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function quitarFavorito(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const articuloId =
      obtenerArticuloId(request);

    await quitarArticuloFavorito(
      usuarioId,
      articuloId,
    );

    response.status(200).json({
      ok: true,
      message:
        "Artículo eliminado de guardados",
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo quitar el artículo";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al quitar favorito:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}