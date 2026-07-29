import type {
  Response,
} from "express";

import type {
  RequestAutenticado,
} from "../middlewares/auth.middleware.js";

import {
  obtenerContactoVendedor,
} from "../services/contacto.service.js";

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
  request: RequestAutenticado,
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
    mensaje.includes(
      "no existe",
    )
  ) {
    return 404;
  }

  if (
    mensaje.includes(
      "tus propios datos",
    )
  ) {
    return 403;
  }

  if (
    mensaje.includes(
      "no es válido",
    )
  ) {
    return 400;
  }

  return 500;
}

export async function obtenerContacto(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const articuloId =
      obtenerArticuloId(request);

    const contacto =
      await obtenerContactoVendedor(
        usuarioId,
        articuloId,
      );

    response.status(200).json({
      ok: true,
      contacto,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo obtener el contacto del vendedor";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al obtener contacto del vendedor:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}