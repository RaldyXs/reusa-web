import type {
  Request,
  Response,
} from "express";

import {
  iniciarSesion,
  registrarUsuario,
  restablecerContrasena as restablecerContrasenaServicio,
  solicitarRecuperacionContrasena as solicitarRecuperacionContrasenaServicio,
} from "../services/auth.service.js";

function obtenerMensajeError(
  error: unknown,
): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error desconocido";
}

export async function login(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const resultado =
      await iniciarSesion(
        request.body,
      );

    response.status(200).json({
      ok: true,
      message:
        "Sesión iniciada correctamente",
      token: resultado.token,
      usuario: resultado.usuario,
    });
  } catch (error) {
    response.status(401).json({
      ok: false,
      message:
        obtenerMensajeError(error),
    });
  }
}

export async function registrar(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const resultado =
      await registrarUsuario(
        request.body,
      );

    response.status(201).json({
      ok: true,
      message:
        "Usuario registrado correctamente",
      usuario: resultado.usuario,
    });
  } catch (error) {
    const mensaje =
      obtenerMensajeError(error);

    const estadoHttp =
      mensaje ===
      "Ya existe un usuario registrado con ese correo"
        ? 409
        : 400;

    response.status(estadoHttp).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function solicitarRecuperacionContrasena(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const resultado =
      await solicitarRecuperacionContrasenaServicio(
        request.body,
      );

    response.status(200).json({
      ok: true,
      message: resultado.mensaje,
    });
  } catch (error) {
    const mensaje =
      obtenerMensajeError(error);

    const estadoHttp =
      mensaje.includes(
        "correo electrónico válido",
      )
        ? 400
        : 500;

    if (estadoHttp === 500) {
      console.error(
        "Error al solicitar recuperación de contraseña:",
        error,
      );
    }

    response.status(estadoHttp).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function restablecerContrasena(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    await restablecerContrasenaServicio(
      request.body,
    );

    response.status(200).json({
      ok: true,
      message:
        "La contraseña fue restablecida correctamente",
    });
  } catch (error) {
    const mensaje =
      obtenerMensajeError(error);

    const erroresSolicitud = [
      "El enlace de recuperación no es válido",
      "El enlace de recuperación no es válido o ha vencido",
      "La contraseña debe tener al menos 8 caracteres",
      "Las contraseñas no coinciden",
    ];

    const estadoHttp =
      erroresSolicitud.some(
        (mensajePermitido) =>
          mensaje.includes(
            mensajePermitido,
          ),
      )
        ? 400
        : 500;

    if (estadoHttp === 500) {
      console.error(
        "Error al restablecer la contraseña:",
        error,
      );
    }

    response.status(estadoHttp).json({
      ok: false,
      message: mensaje,
    });
  }
}