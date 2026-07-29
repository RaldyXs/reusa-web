import type {
  EstadoOferta,
  Oferta,
} from "../models/oferta.model.js";

import {
  actualizarEstadoOfertaEnBaseDeDatos,
  buscarOfertaPendienteEnBaseDeDatos,
  crearOfertaEnBaseDeDatos,
  obtenerOfertaPorIdDesdeBaseDeDatos,
  obtenerOfertasRealizadasDesdeBaseDeDatos,
  obtenerOfertasRecibidasDesdeBaseDeDatos,
} from "../repositories/oferta.repository.js";

import {
  obtenerArticuloPorIdEnBaseDeDatos,
} from "../repositories/articulo.repository.js";

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

function validarPrecio(
  precio: number,
): void {
  if (
    !Number.isFinite(precio) ||
    precio <= 0
  ) {
    throw new Error(
      "El precio ofertado debe ser mayor que cero",
    );
  }

  if (precio > 9999999999.99) {
    throw new Error(
      "El precio ofertado es demasiado alto",
    );
  }
}

function limpiarMensaje(
  mensaje: unknown,
): string | null {
  if (
    mensaje === undefined ||
    mensaje === null
  ) {
    return null;
  }

  if (typeof mensaje !== "string") {
    throw new Error(
      "El mensaje de la oferta no es válido",
    );
  }

  const mensajeLimpio = mensaje.trim();

  if (mensajeLimpio.length === 0) {
    return null;
  }

  if (mensajeLimpio.length > 500) {
    throw new Error(
      "El mensaje no puede superar los 500 caracteres",
    );
  }

  return mensajeLimpio;
}

export async function crearOferta(
  compradorId: number,
  articuloId: number,
  precioOfertado: number,
  mensaje: unknown,
): Promise<{
  ofertaId: number;
}> {
  validarIdentificador(
    compradorId,
    "comprador",
  );

  validarIdentificador(
    articuloId,
    "artículo",
  );

  validarPrecio(
    precioOfertado,
  );

  const mensajeLimpio =
    limpiarMensaje(mensaje);

  const articulo =
    await obtenerArticuloPorIdEnBaseDeDatos(
      articuloId,
    );

  if (!articulo) {
    throw new Error(
      "El artículo indicado no existe",
    );
  }

  if (
    Number(articulo.vendedor_id) ===
    compradorId
  ) {
    throw new Error(
      "No puedes hacer una oferta por tu propia publicación",
    );
  }

  if (
    articulo.estado !== "activo" ||
    Number(articulo.archivado) === 1
  ) {
    throw new Error(
      "El artículo no está disponible para recibir ofertas",
    );
  }

  const ofertaPendiente =
    await buscarOfertaPendienteEnBaseDeDatos(
      compradorId,
      articuloId,
    );

  if (ofertaPendiente) {
    throw new Error(
      "Ya tienes una oferta pendiente para este artículo",
    );
  }

  const ofertaId =
    await crearOfertaEnBaseDeDatos({
      compradorId,
      articuloId,
      precioOfertado,
      mensaje: mensajeLimpio,
    });

  if (
    !Number.isInteger(ofertaId) ||
    ofertaId <= 0
  ) {
    throw new Error(
      "No se pudo registrar la oferta",
    );
  }

  return {
    ofertaId,
  };
}

export async function obtenerOfertasRealizadas(
  compradorId: number,
): Promise<Oferta[]> {
  validarIdentificador(
    compradorId,
    "comprador",
  );

  return obtenerOfertasRealizadasDesdeBaseDeDatos(
    compradorId,
  );
}

export async function obtenerOfertasRecibidas(
  vendedorId: number,
): Promise<Oferta[]> {
  validarIdentificador(
    vendedorId,
    "vendedor",
  );

  return obtenerOfertasRecibidasDesdeBaseDeDatos(
    vendedorId,
  );
}

export async function responderOferta(
  ofertaId: number,
  vendedorId: number,
  estado: Extract<
    EstadoOferta,
    "aceptada" | "rechazada"
  >,
): Promise<void> {
  validarIdentificador(
    ofertaId,
    "oferta",
  );

  validarIdentificador(
    vendedorId,
    "vendedor",
  );

  if (
    estado !== "aceptada" &&
    estado !== "rechazada"
  ) {
    throw new Error(
      "El estado de la oferta no es válido",
    );
  }

  const oferta =
    await obtenerOfertaPorIdDesdeBaseDeDatos(
      ofertaId,
    );

  if (!oferta) {
    throw new Error(
      "La oferta indicada no existe",
    );
  }

  if (
    Number(oferta.vendedor_id) !==
    vendedorId
  ) {
    throw new Error(
      "No tienes permiso para responder esta oferta",
    );
  }

  if (oferta.estado !== "pendiente") {
    throw new Error(
      "La oferta ya fue respondida",
    );
  }

  const actualizada =
    await actualizarEstadoOfertaEnBaseDeDatos(
      ofertaId,
      vendedorId,
      estado,
    );

  if (!actualizada) {
    throw new Error(
      "No se pudo actualizar la oferta",
    );
  }
}