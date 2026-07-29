import type {
  Response,
} from "express";

import type {
  RequestAutenticado,
} from "../middlewares/auth.middleware.js";

import {
  actualizarPerfilUsuario,
  cambiarContrasenaUsuario,
  obtenerPerfilUsuario,
} from "../services/cuenta.service.js";

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
      "contraseña actual no es correcta",
    )
  ) {
    return 401;
  }

  if (
    mensaje.includes(
      "no es válido",
    ) ||
    mensaje.includes(
      "es obligatorio",
    ) ||
    mensaje.includes(
      "no puede superar",
    ) ||
    mensaje.includes(
      "debe tener al menos",
    ) ||
    mensaje.includes(
      "debe ser diferente",
    ) ||
    mensaje.includes(
      "no coinciden",
    ) ||
    mensaje.includes(
      "demasiado larga",
    )
  ) {
    return 400;
  }

  return 500;
}

export async function obtenerPerfil(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const perfil =
      await obtenerPerfilUsuario(
        usuarioId,
      );

    response.status(200).json({
      ok: true,
      perfil,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo obtener el perfil";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al obtener perfil:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function actualizarPerfil(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    const perfil =
      await actualizarPerfilUsuario(
        usuarioId,
        request.body.nombre,
        request.body.apellido,
        request.body.telefono,
        request.body.ubicacion,
      );

    response.status(200).json({
      ok: true,
      message:
        "Perfil actualizado correctamente",
      perfil,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo actualizar el perfil";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al actualizar perfil:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function cambiarContrasena(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId =
      obtenerUsuarioId(request);

    await cambiarContrasenaUsuario(
      usuarioId,
      request.body.contrasenaActual,
      request.body.nuevaContrasena,
      request.body.confirmarContrasena,
    );

    response.status(200).json({
      ok: true,
      message:
        "Contraseña actualizada correctamente",
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo actualizar la contraseña";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al cambiar contraseña:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}