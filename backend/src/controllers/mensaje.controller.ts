import type {
  Response,
} from "express";

import type {
  RequestAutenticado,
} from "../middlewares/auth.middleware.js";

import {
  crearOObtenerConversacion,
  editarMensaje,
  eliminarConversacion,
  eliminarMensaje,
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

function obtenerMensajeId(
  request: RequestAutenticado,
): number {
  const mensajeId = Number(
    request.params.mensajeId,
  );

  if (
    !Number.isInteger(
      mensajeId,
    ) ||
    mensajeId <= 0
  ) {
    throw new Error(
      "El identificador del mensaje no es válido",
    );
  }

  return mensajeId;
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
    ) ||
    mensaje.includes(
      "Debes seleccionar una imagen",
    ) ||
    mensaje.includes(
      "no puede contener una imagen",
    ) ||
    mensaje.includes(
      "Solo se pueden editar",
    ) ||
    mensaje.includes(
      "No puedes editar",
    ) ||
    mensaje.includes(
      "ya fue eliminado",
    ) ||
    mensaje.includes(
      "debe ser diferente",
    ) ||
    mensaje.includes(
      "demasiado larga",
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

    const archivoImagen =
      request.file;

    const urlImagen =
      archivoImagen
        ? `${request.protocol}://${request.get(
            "host",
          )}/uploads/mensajes/${
            archivoImagen.filename
          }`
        : request.body.urlImagen;

    const tipo =
      archivoImagen
        ? "imagen"
        : request.body.tipo ??
          "texto";

    const resultado =
      await enviarMensaje(
        conversacionId,
        remitenteId,
        request.body.contenido,
        tipo,
        urlImagen,
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

export async function actualizarMensaje(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const mensajeId =
      obtenerMensajeId(request);

    await editarMensaje(
      mensajeId,
      usuarioId,
      request.body.contenido,
    );

    response.status(200).json({
      ok: true,
      message:
        "Mensaje editado correctamente",
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo editar el mensaje";

    const codigoEstado =
      obtenerCodigoEstado(
        mensaje,
      );

    if (codigoEstado === 500) {
      console.error(
        "Error al editar mensaje:",
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

export async function borrarMensaje(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const mensajeId =
      obtenerMensajeId(request);

    await eliminarMensaje(
      mensajeId,
      usuarioId,
    );

    response.status(200).json({
      ok: true,
      message:
        "Mensaje eliminado correctamente",
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo eliminar el mensaje";

    const codigoEstado =
      obtenerCodigoEstado(
        mensaje,
      );

    if (codigoEstado === 500) {
      console.error(
        "Error al eliminar mensaje:",
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

export async function borrarConversacion(
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

    await eliminarConversacion(
      conversacionId,
      usuarioId,
    );

    response.status(200).json({
      ok: true,
      message:
        "Conversación eliminada correctamente",
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo eliminar la conversación";

    const codigoEstado =
      obtenerCodigoEstado(
        mensaje,
      );

    if (codigoEstado === 500) {
      console.error(
        "Error al eliminar conversación:",
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