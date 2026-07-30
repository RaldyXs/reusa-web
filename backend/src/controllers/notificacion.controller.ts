import type {
  Response,
} from "express";

import type {
  RequestAutenticado,
} from "../middlewares/auth.middleware.js";

import {
  contarNotificacionesNoLeidas,
  marcarNotificacionComoLeida,
  marcarTodasLasNotificacionesComoLeidas,
  obtenerNotificaciones,
} from "../services/notificacion.service.js";

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

function obtenerNotificacionId(
  request: RequestAutenticado,
): number {
  const notificacionId = Number(
    request.params.notificacionId,
  );

  if (
    !Number.isInteger(
      notificacionId,
    ) ||
    notificacionId <= 0
  ) {
    throw new Error(
      "El identificador de la notificación no es válido",
    );
  }

  return notificacionId;
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
      "no pertenece al usuario",
    )
  ) {
    return 404;
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

export async function listarNotificaciones(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const notificaciones =
      await obtenerNotificaciones(
        usuarioId,
      );

    response.status(200).json({
      ok: true,
      notificaciones,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudieron obtener las notificaciones";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al listar notificaciones:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function obtenerResumenNotificaciones(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const noLeidas =
      await contarNotificacionesNoLeidas(
        usuarioId,
      );

    response.status(200).json({
      ok: true,
      noLeidas,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo obtener el resumen de notificaciones";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al obtener resumen de notificaciones:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function marcarNotificacionLeida(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const notificacionId =
      obtenerNotificacionId(request);

    await marcarNotificacionComoLeida(
      notificacionId,
      usuarioId,
    );

    response.status(200).json({
      ok: true,
      message:
        "Notificación marcada como leída",
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo actualizar la notificación";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al marcar notificación:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function marcarTodasLeidas(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const actualizadas =
      await marcarTodasLasNotificacionesComoLeidas(
        usuarioId,
      );

    response.status(200).json({
      ok: true,
      message:
        "Notificaciones marcadas como leídas",
      actualizadas,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudieron actualizar las notificaciones";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al marcar todas las notificaciones:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}