import type {
  EstadoOferta,
  Oferta,
} from "../models/oferta.model.js";

import {
  actualizarEstadoOfertaEnBaseDeDatos,
  buscarOfertaPendienteEnBaseDeDatos,
  crearContraofertaEnBaseDeDatos,
  crearOfertaEnBaseDeDatos,
  obtenerOfertaPorIdDesdeBaseDeDatos,
  obtenerOfertasRealizadasDesdeBaseDeDatos,
  obtenerOfertasRecibidasDesdeBaseDeDatos,
  responderContraofertaEnBaseDeDatos,
} from "../repositories/oferta.repository.js";

import {
  obtenerArticuloPorIdEnBaseDeDatos,
} from "../repositories/articulo.repository.js";

import {
  crearNotificacion,
} from "./notificacion.service.js";

import type {
  CrearNotificacionDatos,
} from "../models/notificacion.model.js";

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
  nombre = "El precio ofertado",
): void {
  if (
    !Number.isFinite(precio) ||
    precio <= 0
  ) {
    throw new Error(
      `${nombre} debe ser mayor que cero`,
    );
  }

  if (precio > 9999999999.99) {
    throw new Error(
      `${nombre} es demasiado alto`,
    );
  }
}

function limpiarMensaje(
  mensaje: unknown,
  nombre = "El mensaje",
): string | null {
  if (
    mensaje === undefined ||
    mensaje === null
  ) {
    return null;
  }

  if (typeof mensaje !== "string") {
    throw new Error(
      `${nombre} no es válido`,
    );
  }

  const mensajeLimpio =
    mensaje.trim();

  if (!mensajeLimpio) {
    return null;
  }

  if (
    mensajeLimpio.length > 500
  ) {
    throw new Error(
      `${nombre} no puede superar los 500 caracteres`,
    );
  }

  return mensajeLimpio;
}

async function crearNotificacionSegura(
  datos: CrearNotificacionDatos,
): Promise<void> {
  try {
    await crearNotificacion(datos);
  } catch (error) {
    console.error(
      "No se pudo crear la notificación:",
      error,
    );
  }
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

  const vendedorId = Number(
    articulo.vendedor_id,
  );

  if (
    vendedorId === compradorId
  ) {
    throw new Error(
      "No puedes hacer una oferta por tu propia publicación",
    );
  }

  if (
    articulo.estado !== "activo" ||
    Number(
      articulo.archivado,
    ) === 1
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
      "Ya tienes una oferta activa para este artículo",
    );
  }

  const ofertaId =
    await crearOfertaEnBaseDeDatos({
      compradorId,
      articuloId,
      precioOfertado,
      mensaje:
        mensajeLimpio,
    });

  if (
    !Number.isInteger(
      ofertaId,
    ) ||
    ofertaId <= 0
  ) {
    throw new Error(
      "No se pudo registrar la oferta",
    );
  }

  await crearNotificacionSegura({
    usuarioId: vendedorId,
    tipo: "oferta_recibida",
    titulo: "Nueva oferta recibida",
    mensaje:
      `Recibiste una oferta de RD$${precioOfertado.toLocaleString(
        "es-DO",
      )} por "${articulo.titulo}".`,
    enlace: "/historial-ventas",
  });

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
    Number(
      oferta.vendedor_id,
    ) !== vendedorId
  ) {
    throw new Error(
      "No tienes permiso para responder esta oferta",
    );
  }

  if (
    oferta.estado !==
    "pendiente"
  ) {
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

  await crearNotificacionSegura({
    usuarioId: Number(
      oferta.comprador_id,
    ),
    tipo:
      estado === "aceptada"
        ? "oferta_aceptada"
        : "oferta_rechazada",
    titulo:
      estado === "aceptada"
        ? "Oferta aceptada"
        : "Oferta rechazada",
    mensaje:
      estado === "aceptada"
        ? "El vendedor aceptó tu oferta."
        : "El vendedor rechazó tu oferta.",
    enlace: "/historial-compras",
  });

  if (estado === "aceptada") {
    await crearNotificacionSegura({
      usuarioId: vendedorId,
      tipo: "articulo_vendido",
      titulo: "Artículo vendido",
      mensaje:
        "Una oferta fue aceptada y el artículo fue marcado como vendido.",
      enlace: "/historial-ventas",
    });
  }
}

export async function crearContraoferta(
  ofertaId: number,
  vendedorId: number,
  precioContraoferta: number,
  mensajeContraoferta: unknown,
): Promise<void> {
  validarIdentificador(
    ofertaId,
    "oferta",
  );

  validarIdentificador(
    vendedorId,
    "vendedor",
  );

  validarPrecio(
    precioContraoferta,
    "El precio de la contraoferta",
  );

  const mensajeLimpio =
    limpiarMensaje(
      mensajeContraoferta,
      "El mensaje de la contraoferta",
    );

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
    Number(
      oferta.vendedor_id,
    ) !== vendedorId
  ) {
    throw new Error(
      "No tienes permiso para enviar una contraoferta",
    );
  }

  if (
    oferta.estado !==
    "pendiente"
  ) {
    throw new Error(
      "Solo puedes contraofertar una oferta pendiente",
    );
  }

  const actualizada =
    await crearContraofertaEnBaseDeDatos({
      ofertaId,
      vendedorId,
      precioContraoferta,
      mensajeContraoferta:
        mensajeLimpio,
    });

  if (!actualizada) {
    throw new Error(
      "No se pudo registrar la contraoferta",
    );
  }

  await crearNotificacionSegura({
    usuarioId: Number(
      oferta.comprador_id,
    ),
    tipo: "contraoferta_recibida",
    titulo: "Contraoferta recibida",
    mensaje:
      `El vendedor propuso RD$${precioContraoferta.toLocaleString(
        "es-DO",
      )}.`,
    enlace: "/historial-compras",
  });
}

export async function responderContraoferta(
  ofertaId: number,
  compradorId: number,
  aceptar: boolean,
): Promise<void> {
  validarIdentificador(
    ofertaId,
    "oferta",
  );

  validarIdentificador(
    compradorId,
    "comprador",
  );

  if (
    typeof aceptar !==
    "boolean"
  ) {
    throw new Error(
      "La respuesta de la contraoferta no es válida",
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
    Number(
      oferta.comprador_id,
    ) !== compradorId
  ) {
    throw new Error(
      "No tienes permiso para responder esta contraoferta",
    );
  }

  if (
    oferta.estado !==
    "contraoferta"
  ) {
    throw new Error(
      "La oferta no tiene una contraoferta pendiente",
    );
  }

  const actualizada =
    await responderContraofertaEnBaseDeDatos({
      ofertaId,
      compradorId,
      aceptar,
    });

  if (!actualizada) {
    throw new Error(
      "No se pudo responder la contraoferta",
    );
  }

  const vendedorId = Number(
    oferta.vendedor_id,
  );

  await crearNotificacionSegura({
    usuarioId: vendedorId,
    tipo:
      aceptar
        ? "contraoferta_aceptada"
        : "contraoferta_rechazada",
    titulo:
      aceptar
        ? "Contraoferta aceptada"
        : "Contraoferta rechazada",
    mensaje:
      aceptar
        ? "El comprador aceptó tu contraoferta."
        : "El comprador rechazó tu contraoferta.",
    enlace: "/historial-ventas",
  });

  if (aceptar) {
    await crearNotificacionSegura({
      usuarioId: compradorId,
      tipo: "articulo_vendido",
      titulo: "Compra confirmada",
      mensaje:
        "Aceptaste la contraoferta y el artículo fue marcado como vendido.",
      enlace: "/historial-compras",
    });

    await crearNotificacionSegura({
      usuarioId: vendedorId,
      tipo: "articulo_vendido",
      titulo: "Artículo vendido",
      mensaje:
        "El comprador aceptó tu contraoferta y el artículo fue marcado como vendido.",
      enlace: "/historial-ventas",
    });
  }
}