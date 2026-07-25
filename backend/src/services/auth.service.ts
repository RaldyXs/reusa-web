import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type {
  RolUsuario,
  UsuarioSesion,
} from "../models/auth.model.js";

import {
  buscarUsuarioPorEmail,
  crearUsuarioEnBaseDeDatos,
} from "../repositories/auth.repository.js";

interface CredencialesLogin {
  email?: unknown;
  contrasena?: unknown;
}

interface RegistroUsuarioEntrada {
  nombre?: unknown;
  apellido?: unknown;
  email?: unknown;
  contrasena?: unknown;
  confirmarContrasena?: unknown;
  telefono?: unknown;
  ubicacion?: unknown;
}

interface ResultadoLogin {
  token: string;
  usuario: UsuarioSesion;
}

interface ResultadoRegistro {
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

function normalizarTexto(
  valor: unknown,
): string {
  return typeof valor === "string"
    ? valor.trim()
    : "";
}

function validarFormatoEmail(
  email: string,
): boolean {
  const patronEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return patronEmail.test(email);
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

  const usuario =
    await buscarUsuarioPorEmail(email);

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
    usuarioId: Number(
      usuario.usuario_id,
    ),
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

export async function registrarUsuario(
  entrada: RegistroUsuarioEntrada,
): Promise<ResultadoRegistro> {
  const nombre =
    normalizarTexto(entrada.nombre);

  const apellido =
    normalizarTexto(entrada.apellido);

  const email =
    normalizarTexto(
      entrada.email,
    ).toLowerCase();

  const contrasena =
    typeof entrada.contrasena === "string"
      ? entrada.contrasena
      : "";

  const confirmarContrasena =
    typeof entrada.confirmarContrasena ===
    "string"
      ? entrada.confirmarContrasena
      : "";

  const telefono =
    normalizarTexto(entrada.telefono);

  const ubicacion =
    normalizarTexto(entrada.ubicacion);

  if (nombre.length < 2) {
    throw new Error(
      "El nombre debe tener al menos 2 caracteres",
    );
  }

  if (apellido.length < 2) {
    throw new Error(
      "El apellido debe tener al menos 2 caracteres",
    );
  }

  if (!email) {
    throw new Error(
      "El correo electrónico es obligatorio",
    );
  }

  if (!validarFormatoEmail(email)) {
    throw new Error(
      "El correo electrónico no tiene un formato válido",
    );
  }

  if (contrasena.length < 8) {
    throw new Error(
      "La contraseña debe tener al menos 8 caracteres",
    );
  }

  if (
    contrasena !==
    confirmarContrasena
  ) {
    throw new Error(
      "Las contraseñas no coinciden",
    );
  }

  if (!telefono) {
    throw new Error(
      "El teléfono es obligatorio",
    );
  }

  if (!ubicacion) {
    throw new Error(
      "La ubicación es obligatoria",
    );
  }

  const usuarioExistente =
    await buscarUsuarioPorEmail(email);

  if (usuarioExistente) {
    throw new Error(
      "Ya existe un usuario registrado con ese correo",
    );
  }

  const contrasenaCifrada =
    await bcrypt.hash(
      contrasena,
      12,
    );

  const rol: RolUsuario = "usuario";

  const usuarioId =
    await crearUsuarioEnBaseDeDatos({
      nombre,
      apellido,
      email,
      contrasena: contrasenaCifrada,
      telefono,
      ubicacion,
      rol,
    });

  const usuario: UsuarioSesion = {
    usuarioId,
    nombre,
    apellido,
    email,
    rol,
  };

  return {
    usuario,
  };
}