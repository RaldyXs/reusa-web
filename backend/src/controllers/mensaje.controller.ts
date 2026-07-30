import type {
  Response,
} from "express";

import type {
  RequestAutenticado,
} from "../middlewares/auth.middleware.js";

import {
  crearOObtenerConversacion,
  enviarMensaje,
  obtenerConversaciones,
  obtenerMensajes,
} from "../services/mensaje.service.js";

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

function obtenerConversacionId(
  request: RequestAutenticado,
): number {
  const conversacionId = Number(
    request.params.conversacionId,
  );

  if (
    !Number.isInteger(
      conversacionId,
    ) ||
    conversacionId <= 0
  ) {
    throw new Error(
      "El identificador de la conversación no es válido",
    );
  }

  return conversacionId;
}

function obtenerArticuloId(
  request: RequestAutenticado,
): number {
  const articuloId = Number(
    request.body.articuloId,
  );

  if (
    !Number.isInteger(
      articuloId,
    ) ||
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
      "No tienes permiso",
    )
  ) {
    return 403;
  }

  if (
    mensaje.includes(
      "no existe",
    ) ||
    mensaje.includes(
      "fue eliminado",
    )
  ) {
    return 404;
  }

  if (
    mensaje.includes(
      "no es válido",
    ) ||
    mensaje.includes(
      "no puede estar vacío",
    ) ||
    mensaje.includes(
      "no puede superar",
    ) ||
    mensaje.includes(
      "contigo mismo",
    )
  ) {
    return 400;
  }

  return 500;
}

export async function iniciarConversacion(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const compradorId =
      obtenerUsuarioId(request);

    const articuloId =
      obtenerArticuloId(request);

    const resultado =
      await crearOObtenerConversacion(
        articuloId,
        compradorId,
      );

    response.status(200).json({
      ok: true,
      message:
        "Conversación disponible",
      conversacion: resultado,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo iniciar la conversación";

    const codigoEstado =
      obtenerCodigoEstado(
        mensaje,
      );

    if (codigoEstado === 500) {
      console.error(
        "Error al iniciar conversación:",
        errorDesconocido,
      );
    }

    response
      .status(codigoEstado)
      .json({
        ok: false,
        message: mensaje,
      });
  }
}

export async function listarConversaciones(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const conversaciones =
      await obtenerConversaciones(
        usuarioId,
      );

    response.status(200).json({
      ok: true,
      conversaciones,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudieron obtener las conversaciones";

    const codigoEstado =
      obtenerCodigoEstado(
        mensaje,
      );

    if (codigoEstado === 500) {
      console.error(
        "Error al listar conversaciones:",
        errorDesconocido,
      );
    }

    response
      .status(codigoEstado)
      .json({
        ok: false,
        message: mensaje,
      });
  }
}

export async function listarMensajes(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const conversacionId =
      obtenerConversacionId(
        request,
      );

    const mensajes =
      await obtenerMensajes(
        conversacionId,
        usuarioId,
      );

    response.status(200).json({
      ok: true,
      mensajes,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudieron obtener los mensajes";

    const codigoEstado =
      obtenerCodigoEstado(
        mensaje,
      );

    if (codigoEstado === 500) {
      console.error(
        "Error al listar mensajes:",
        errorDesconocido,
      );
    }

    response
      .status(codigoEstado)
      .json({
        ok: false,
        message: mensaje,
      });
  }
}

export async function registrarMensaje(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const remitenteId =
      obtenerUsuarioId(request);

    const conversacionId =
      obtenerConversacionId(
        request,
      );

    const resultado =
      await enviarMensaje(
        conversacionId,
        remitenteId,
        request.body.contenido,
      );

    response.status(201).json({
      ok: true,
      message:
        "Mensaje enviado correctamente",
      mensaje: resultado,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo enviar el mensaje";

    const codigoEstado =
      obtenerCodigoEstado(
        mensaje,
      );

    if (codigoEstado === 500) {
      console.error(
        "Error al enviar mensaje:",
        errorDesconocido,
      );
    }

    response
      .status(codigoEstado)
      .json({
        ok: false,
        message: mensaje,
      });
  }
}