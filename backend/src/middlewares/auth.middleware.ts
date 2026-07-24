import type {
  NextFunction,
  Request,
  Response,
} from "express";
import jwt from "jsonwebtoken";

import type { RolUsuario } from "../models/auth.model.js";

export interface UsuarioToken {
  usuarioId: number;
  email: string;
  rol: RolUsuario;
}

export interface RequestAutenticado extends Request {
  usuario?: UsuarioToken;
}

function obtenerJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "La variable JWT_SECRET no está configurada",
    );
  }

  return jwtSecret;
}

export function verificarToken(
  request: RequestAutenticado,
  response: Response,
  next: NextFunction,
): void {
  try {
    const autorizacion =
      request.headers.authorization;

    if (
      !autorizacion ||
      !autorizacion.startsWith("Bearer ")
    ) {
      response.status(401).json({
        ok: false,
        message:
          "Debes iniciar sesión para realizar esta acción",
      });

      return;
    }

    const token = autorizacion.slice(7).trim();

    const payload = jwt.verify(
      token,
      obtenerJwtSecret(),
    ) as UsuarioToken;

    if (
      !payload.usuarioId ||
      !payload.email ||
      !payload.rol
    ) {
      response.status(401).json({
        ok: false,
        message: "El token no es válido",
      });

      return;
    }

    request.usuario = payload;

    next();
  } catch {
    response.status(401).json({
      ok: false,
      message:
        "La sesión no es válida o ha expirado",
    });
  }
}

export function permitirRoles(
  rolesPermitidos: RolUsuario[],
) {
  return (
    request: RequestAutenticado,
    response: Response,
    next: NextFunction,
  ): void => {
    if (!request.usuario) {
      response.status(401).json({
        ok: false,
        message: "Debes iniciar sesión",
      });

      return;
    }

    if (
      !rolesPermitidos.includes(
        request.usuario.rol,
      )
    ) {
      response.status(403).json({
        ok: false,
        message:
          "No tienes permiso para realizar esta acción",
      });

      return;
    }

    next();
  };
}