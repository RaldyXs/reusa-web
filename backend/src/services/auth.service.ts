import bcrypt from "bcryptjs";
import {
  createHash,
  randomBytes,
} from "node:crypto";
import jwt from "jsonwebtoken";

import type {
  RolUsuario,
  UsuarioSesion,
} from "../models/auth.model.js";

import {
  actualizarContrasenaUsuario,
  buscarUsuarioPorEmail,
  buscarUsuarioPorTokenRecuperacion,
  crearUsuarioEnBaseDeDatos,
  guardarTokenRecuperacion,
  invalidarTokenRecuperacion,
} from "../repositories/auth.repository.js";

import {
  enviarCorreoRecuperacion,
} from "./correo.service.js";

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

interface SolicitudRecuperacionEntrada {
  email?: unknown;
}

interface RestablecerContrasenaEntrada {
  token?: unknown;
  contrasena?: unknown;
  confirmarContrasena?: unknown;
}

interface ResultadoLogin {
  token: string;
  usuario: UsuarioSesion;
}

interface ResultadoRegistro {
  usuario: UsuarioSesion;
}

interface ResultadoRecuperacion {
  mensaje: string;
}

interface TokenPayload {
  usuarioId: number;
  email: string;
  rol: RolUsuario;
}

const MENSAJE_RECUPERACION =
  "Si existe una cuenta asociada a ese correo, recibirás un enlace para restablecer tu contraseña.";

function obtenerJwtSecret(): string {
  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "La variable JWT_SECRET no está configurada",
    );
  }

  return jwtSecret;
}

function obtenerFrontendUrl(): string {
  const frontendUrl =
    process.env.FRONTEND_URL?.trim();

  if (!frontendUrl) {
    throw new Error(
      "La variable FRONTEND_URL no está configurada",
    );
  }

  return frontendUrl.replace(
    /\/+$/,
    "",
  );
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

function crearHashToken(
  token: string,
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function validarNuevaContrasena(
  contrasena: string,
  confirmarContrasena: string,
): void {
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
}

export async function iniciarSesion(
  datos: CredencialesLogin,
): Promise<ResultadoLogin> {
  const email =
    typeof datos.email === "string"
      ? datos.email
          .trim()
          .toLowerCase()
      : "";

  const contrasena =
    typeof datos.contrasena ===
    "string"
      ? datos.contrasena
      : "";

  if (
    !email ||
    !contrasena
  ) {
    throw new Error(
      "El correo y la contraseña son obligatorios",
    );
  }

  const usuario =
    await buscarUsuarioPorEmail(
      email,
    );

  if (!usuario) {
    throw new Error(
      "Correo o contraseña incorrectos",
    );
  }

  if (
    Number(usuario.activo) !== 1
  ) {
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
    usuarioId:
      usuarioSesion.usuarioId,

    email:
      usuarioSesion.email,

    rol:
      usuarioSesion.rol,
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
    normalizarTexto(
      entrada.nombre,
    );

  const apellido =
    normalizarTexto(
      entrada.apellido,
    );

  const email =
    normalizarTexto(
      entrada.email,
    ).toLowerCase();

  const contrasena =
    typeof entrada.contrasena ===
    "string"
      ? entrada.contrasena
      : "";

  const confirmarContrasena =
    typeof entrada.confirmarContrasena ===
    "string"
      ? entrada.confirmarContrasena
      : "";

  const telefono =
    normalizarTexto(
      entrada.telefono,
    );

  const ubicacion =
    normalizarTexto(
      entrada.ubicacion,
    );

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

  if (
    !validarFormatoEmail(email)
  ) {
    throw new Error(
      "El correo electrónico no tiene un formato válido",
    );
  }

  validarNuevaContrasena(
    contrasena,
    confirmarContrasena,
  );

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
    await buscarUsuarioPorEmail(
      email,
    );

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

  const rol: RolUsuario =
    "usuario";

  const usuarioId =
    await crearUsuarioEnBaseDeDatos({
      nombre,
      apellido,
      email,
      contrasena:
        contrasenaCifrada,
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

export async function solicitarRecuperacionContrasena(
  entrada: SolicitudRecuperacionEntrada,
): Promise<ResultadoRecuperacion> {
  const email =
    normalizarTexto(
      entrada.email,
    ).toLowerCase();

  if (
    !email ||
    !validarFormatoEmail(email)
  ) {
    throw new Error(
      "Debes indicar un correo electrónico válido",
    );
  }

  const usuario =
    await buscarUsuarioPorEmail(
      email,
    );

  /*
   * Se devuelve el mismo mensaje aunque el
   * correo no exista para no revelar qué
   * cuentas están registradas.
   */
  if (
    !usuario ||
    Number(usuario.activo) !== 1
  ) {
    return {
      mensaje:
        MENSAJE_RECUPERACION,
    };
  }

  const token =
    randomBytes(32).toString(
      "hex",
    );

  const tokenHash =
    crearHashToken(token);

  const fechaExpiracion =
    new Date(
      Date.now() +
        60 * 60 * 1000,
    );

  const tokenGuardado =
    await guardarTokenRecuperacion(
      Number(
        usuario.usuario_id,
      ),
      tokenHash,
      fechaExpiracion,
    );

  if (!tokenGuardado) {
    throw new Error(
      "No se pudo crear la solicitud de recuperación",
    );
  }

  const enlaceRecuperacion =
    `${obtenerFrontendUrl()}` +
    `/restablecer-contrasena` +
    `?token=${encodeURIComponent(
      token,
    )}`;

  try {
    await enviarCorreoRecuperacion({
      destinatario:
        usuario.email,

      nombreUsuario:
        usuario.nombre,

      enlaceRecuperacion,
    });
  } catch (errorDesconocido) {
    await invalidarTokenRecuperacion(
      Number(
        usuario.usuario_id,
      ),
    );

    console.error(
      "Error al enviar el correo de recuperación:",
      errorDesconocido,
    );

    throw new Error(
      "No se pudo enviar el correo de recuperación",
    );
  }

  return {
    mensaje:
      MENSAJE_RECUPERACION,
  };
}

export async function restablecerContrasena(
  entrada: RestablecerContrasenaEntrada,
): Promise<void> {
  const token =
    normalizarTexto(
      entrada.token,
    );

  const contrasena =
    typeof entrada.contrasena ===
    "string"
      ? entrada.contrasena
      : "";

  const confirmarContrasena =
    typeof entrada.confirmarContrasena ===
    "string"
      ? entrada.confirmarContrasena
      : "";

  if (!token) {
    throw new Error(
      "El enlace de recuperación no es válido",
    );
  }

  validarNuevaContrasena(
    contrasena,
    confirmarContrasena,
  );

  const tokenHash =
    crearHashToken(token);

  const usuario =
    await buscarUsuarioPorTokenRecuperacion(
      tokenHash,
    );

  if (!usuario) {
    throw new Error(
      "El enlace de recuperación no es válido o ha vencido",
    );
  }

  const contrasenaCifrada =
    await bcrypt.hash(
      contrasena,
      12,
    );

  const actualizada =
    await actualizarContrasenaUsuario(
      Number(
        usuario.usuario_id,
      ),
      contrasenaCifrada,
    );

  if (!actualizada) {
    throw new Error(
      "No se pudo actualizar la contraseña",
    );
  }

  const tokenInvalidado =
    await invalidarTokenRecuperacion(
      Number(
        usuario.usuario_id,
      ),
    );

  if (!tokenInvalidado) {
    console.error(
      "La contraseña fue actualizada, pero no se pudo invalidar el token de recuperación",
    );
  }
}