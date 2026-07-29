const bcrypt = require("bcrypt") as any;

import type {
  PerfilUsuario,
} from "../repositories/cuenta.repository.js";

import {
  actualizarContrasenaUsuarioEnBaseDeDatos,
  actualizarPerfilUsuarioEnBaseDeDatos,
  obtenerContrasenaUsuarioDesdeBaseDeDatos,
  obtenerPerfilUsuarioDesdeBaseDeDatos,
} from "../repositories/cuenta.repository.js";

function validarIdentificador(
  valor: number,
  nombre: string,
): void {
  if (
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    throw new Error(
      `El identificador de ${nombre} no es válido`,
    );
  }
}

function limpiarTextoObligatorio(
  valor: unknown,
  nombre: string,
  longitudMaxima: number,
): string {
  if (typeof valor !== "string") {
    throw new Error(
      `${nombre} no es válido`,
    );
  }

  const textoLimpio = valor.trim();

  if (!textoLimpio) {
    throw new Error(
      `${nombre} es obligatorio`,
    );
  }

  if (
    textoLimpio.length >
    longitudMaxima
  ) {
    throw new Error(
      `${nombre} no puede superar los ${longitudMaxima} caracteres`,
    );
  }

  return textoLimpio;
}

function limpiarTextoOpcional(
  valor: unknown,
  nombre: string,
  longitudMaxima: number,
): string | null {
  if (
    valor === undefined ||
    valor === null
  ) {
    return null;
  }

  if (typeof valor !== "string") {
    throw new Error(
      `${nombre} no es válido`,
    );
  }

  const textoLimpio = valor.trim();

  if (!textoLimpio) {
    return null;
  }

  if (
    textoLimpio.length >
    longitudMaxima
  ) {
    throw new Error(
      `${nombre} no puede superar los ${longitudMaxima} caracteres`,
    );
  }

  return textoLimpio;
}

export async function obtenerPerfilUsuario(
  usuarioId: number,
): Promise<PerfilUsuario> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  const perfil =
    await obtenerPerfilUsuarioDesdeBaseDeDatos(
      usuarioId,
    );

  if (!perfil) {
    throw new Error(
      "El usuario indicado no existe",
    );
  }

  return {
    ...perfil,
    activo: Number(
      perfil.activo,
    ),
  };
}

export async function actualizarPerfilUsuario(
  usuarioId: number,
  nombre: unknown,
  apellido: unknown,
  telefono: unknown,
  ubicacion: unknown,
): Promise<PerfilUsuario> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  const nombreLimpio =
    limpiarTextoObligatorio(
      nombre,
      "El nombre",
      100,
    );

  const apellidoLimpio =
    limpiarTextoObligatorio(
      apellido,
      "El apellido",
      100,
    );

  const telefonoLimpio =
    limpiarTextoOpcional(
      telefono,
      "El teléfono",
      30,
    );

  const ubicacionLimpia =
    limpiarTextoOpcional(
      ubicacion,
      "La ubicación",
      200,
    );

  const perfilActual =
    await obtenerPerfilUsuarioDesdeBaseDeDatos(
      usuarioId,
    );

  if (!perfilActual) {
    throw new Error(
      "El usuario indicado no existe",
    );
  }

  const actualizado =
    await actualizarPerfilUsuarioEnBaseDeDatos(
      usuarioId,
      {
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        telefono: telefonoLimpio,
        ubicacion: ubicacionLimpia,
      },
    );

  if (!actualizado) {
    throw new Error(
      "No se pudo actualizar el perfil",
    );
  }

  return obtenerPerfilUsuario(
    usuarioId,
  );
}

export async function cambiarContrasenaUsuario(
  usuarioId: number,
  contrasenaActual: unknown,
  nuevaContrasena: unknown,
  confirmarContrasena: unknown,
): Promise<void> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  if (
    typeof contrasenaActual !==
      "string" ||
    !contrasenaActual
  ) {
    throw new Error(
      "La contraseña actual es obligatoria",
    );
  }

  if (
    typeof nuevaContrasena !==
      "string" ||
    nuevaContrasena.length < 8
  ) {
    throw new Error(
      "La nueva contraseña debe tener al menos 8 caracteres",
    );
  }

  if (
    nuevaContrasena.length > 255
  ) {
    throw new Error(
      "La nueva contraseña es demasiado larga",
    );
  }

  if (
    nuevaContrasena ===
    contrasenaActual
  ) {
    throw new Error(
      "La nueva contraseña debe ser diferente de la actual",
    );
  }

  if (
    nuevaContrasena !==
    confirmarContrasena
  ) {
    throw new Error(
      "Las contraseñas nuevas no coinciden",
    );
  }

  const contrasenaGuardada =
    await obtenerContrasenaUsuarioDesdeBaseDeDatos(
      usuarioId,
    );

  if (!contrasenaGuardada) {
    throw new Error(
      "El usuario indicado no existe",
    );
  }

  const contrasenaCorrecta =
    await bcrypt.compare(
      contrasenaActual,
      contrasenaGuardada,
    );

  if (!contrasenaCorrecta) {
    throw new Error(
      "La contraseña actual no es correcta",
    );
  }

  const nuevaContrasenaHash =
    await bcrypt.hash(
      nuevaContrasena,
      12,
    );

  const actualizada =
    await actualizarContrasenaUsuarioEnBaseDeDatos(
      usuarioId,
      nuevaContrasenaHash,
    );

  if (!actualizada) {
    throw new Error(
      "No se pudo actualizar la contraseña",
    );
  }
}