import type {
  CrearNotificacionDatos,
  Notificacion,
} from "../models/notificacion.model.js";

import {
  contarNotificacionesNoLeidasEnBaseDeDatos,
  crearNotificacionEnBaseDeDatos,
  marcarNotificacionComoLeidaEnBaseDeDatos,
  marcarTodasLasNotificacionesComoLeidasEnBaseDeDatos,
  obtenerNotificacionesDesdeBaseDeDatos,
} from "../repositories/notificacion.repository.js";

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

function limpiarTexto(
  valor: unknown,
  nombre: string,
  maximo: number,
): string {
  if (typeof valor !== "string") {
    throw new Error(
      `${nombre} no es válido`,
    );
  }

  const texto = valor.trim();

  if (!texto) {
    throw new Error(
      `${nombre} es obligatorio`,
    );
  }

  if (texto.length > maximo) {
    throw new Error(
      `${nombre} no puede superar los ${maximo} caracteres`,
    );
  }

  return texto;
}

function limpiarEnlace(
  enlace: unknown,
): string | null {
  if (
    enlace === undefined ||
    enlace === null
  ) {
    return null;
  }

  if (typeof enlace !== "string") {
    throw new Error(
      "El enlace de la notificación no es válido",
    );
  }

  const enlaceLimpio = enlace.trim();

  if (!enlaceLimpio) {
    return null;
  }

  if (enlaceLimpio.length > 300) {
    throw new Error(
      "El enlace de la notificación no puede superar los 300 caracteres",
    );
  }

  return enlaceLimpio;
}

export async function crearNotificacion(
  datos: CrearNotificacionDatos,
): Promise<number> {
  validarIdentificador(
    datos.usuarioId,
    "usuario",
  );

  const titulo = limpiarTexto(
    datos.titulo,
    "El título",
    150,
  );

  const mensaje = limpiarTexto(
    datos.mensaje,
    "El mensaje",
    500,
  );

  const enlace = limpiarEnlace(
    datos.enlace,
  );

  const notificacionId =
    await crearNotificacionEnBaseDeDatos({
      usuarioId: datos.usuarioId,
      tipo: datos.tipo,
      titulo,
      mensaje,
      enlace,
    });

  if (
    !Number.isInteger(
      notificacionId,
    ) ||
    notificacionId <= 0
  ) {
    throw new Error(
      "No se pudo crear la notificación",
    );
  }

  return notificacionId;
}

export async function obtenerNotificaciones(
  usuarioId: number,
): Promise<Notificacion[]> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  return obtenerNotificacionesDesdeBaseDeDatos(
    usuarioId,
  );
}

export async function contarNotificacionesNoLeidas(
  usuarioId: number,
): Promise<number> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  return contarNotificacionesNoLeidasEnBaseDeDatos(
    usuarioId,
  );
}

export async function marcarNotificacionComoLeida(
  notificacionId: number,
  usuarioId: number,
): Promise<void> {
  validarIdentificador(
    notificacionId,
    "notificación",
  );

  validarIdentificador(
    usuarioId,
    "usuario",
  );

  const actualizada =
    await marcarNotificacionComoLeidaEnBaseDeDatos(
      notificacionId,
      usuarioId,
    );

  if (!actualizada) {
    throw new Error(
      "La notificación indicada no existe o no pertenece al usuario",
    );
  }
}

export async function marcarTodasLasNotificacionesComoLeidas(
  usuarioId: number,
): Promise<number> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  return marcarTodasLasNotificacionesComoLeidasEnBaseDeDatos(
    usuarioId,
  );
}