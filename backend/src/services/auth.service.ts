import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type {
  RolUsuario,
  UsuarioSesion,
} from "../models/auth.model.js";

import { buscarUsuarioPorEmail } from "../repositories/auth.repository.js";

interface CredencialesLogin {
  email?: unknown;
  contrasena?: unknown;
}

interface ResultadoLogin {
  token: string;
  usuario: UsuarioSesion;
}

interface TokenPayload {
  usuarioId: number;
  email: string;
  rol: RolUsuario;
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

export async function iniciarSesion(
  datos: CredencialesLogin,
): Promise<ResultadoLogin> {
  const email =
    typeof datos.email === "string"
      ? datos.email.trim().toLowerCase()
      : "";

  const contrasena =
    typeof datos.contrasena === "string"
      ? datos.contrasena
      : "";

  if (!email || !contrasena) {
    throw new Error(
      "El correo y la contraseña son obligatorios",
    );
  }

  const usuario = await buscarUsuarioPorEmail(email);

  if (!usuario) {
    throw new Error(
      "Correo o contraseña incorrectos",
    );
  }

  if (Number(usuario.activo) !== 1) {
    throw new Error(
      "Esta cuenta se encuentra desactivada",
    );
  }

  const contrasenaCorrecta =
    await bcrypt.compare(
      contrasena,
      usuario.contrasena,
    );

  if (!contrasenaCorrecta) {
    throw new Error(
      "Correo o contraseña incorrectos",
    );
  }

  const usuarioSesion: UsuarioSesion = {
    usuarioId: Number(usuario.usuario_id),
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    rol: usuario.rol,
  };

  const payload: TokenPayload = {
    usuarioId: usuarioSesion.usuarioId,
    email: usuarioSesion.email,
    rol: usuarioSesion.rol,
  };

  const token = jwt.sign(
    payload,
    obtenerJwtSecret(),
    {
      expiresIn: "8h",
    },
  );

  return {
    token,
    usuario: usuarioSesion,
  };
}