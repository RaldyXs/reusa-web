import type { Request, Response } from "express";

import {
  iniciarSesion,
  registrarUsuario,
} from "../services/auth.service.js";

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

export async function registrar(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const resultado = await registrarUsuario(
      request.body,
    );

    response.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      usuario: resultado.usuario,
    });
  } catch (error) {
    const mensaje = obtenerMensajeError(error);

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