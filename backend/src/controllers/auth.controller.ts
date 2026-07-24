import type { Request, Response } from "express";

import { iniciarSesion } from "../services/auth.service.js";

function obtenerMensajeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error desconocido";
}

export async function login(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const resultado = await iniciarSesion(
      request.body,
    );

    response.status(200).json({
      ok: true,
      message: "Sesión iniciada correctamente",
      token: resultado.token,
      usuario: resultado.usuario,
    });
  } catch (error) {
    response.status(401).json({
      ok: false,
      message: obtenerMensajeError(error),
    });
  }
}