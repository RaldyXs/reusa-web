import type {
  Conversacion,
  Mensaje,
} from "../models/mensaje.model.js";

import {
  buscarConversacionExistenteEnBaseDeDatos,
  crearConversacionEnBaseDeDatos,
  crearMensajeEnBaseDeDatos,
  marcarMensajesComoLeidosEnBaseDeDatos,
  obtenerConversacionPorIdEnBaseDeDatos,
  obtenerConversacionesDeUsuarioEnBaseDeDatos,
  obtenerMensajesDeConversacionEnBaseDeDatos,
} from "../repositories/mensaje.repository.js";

import {
  obtenerArticuloPorIdEnBaseDeDatos,
} from "../repositories/articulo.repository.js";

import {
  crearNotificacion,
} from "./notificacion.service.js";

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

function limpiarContenido(
  contenido: unknown,
): string {
  if (typeof contenido !== "string") {
    throw new Error(
      "El contenido del mensaje no es válido",
    );
  }

  const contenidoLimpio =
    contenido.trim();

  if (!contenidoLimpio) {
    throw new Error(
      "El mensaje no puede estar vacío",
    );
  }

  if (contenidoLimpio.length > 1000) {
    throw new Error(
      "El mensaje no puede superar los 1000 caracteres",
    );
  }

  return contenidoLimpio;
}

function usuarioPerteneceAConversacion(
  usuarioId: number,
  conversacion: {
    comprador_id: number;
    vendedor_id: number;
  },
): boolean {
  return (
    Number(
      conversacion.comprador_id,
    ) === usuarioId ||
    Number(
      conversacion.vendedor_id,
    ) === usuarioId
  );
}

export async function crearOObtenerConversacion(
  articuloId: number,
  compradorId: number,
): Promise<{
  conversacionId: number;
}> {
  validarIdentificador(
    articuloId,
    "artículo",
  );

  validarIdentificador(
    compradorId,
    "comprador",
  );

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

  validarIdentificador(
    vendedorId,
    "vendedor",
  );

  if (vendedorId === compradorId) {
    throw new Error(
      "No puedes iniciar una conversación contigo mismo",
    );
  }

  if (
    Number(
      (
        articulo as typeof articulo & {
          eliminado?: number;
        }
      ).eliminado ?? 0,
    ) === 1
  ) {
    throw new Error(
      "El artículo fue eliminado",
    );
  }

  const conversacionExistente =
    await buscarConversacionExistenteEnBaseDeDatos(
      articuloId,
      compradorId,
      vendedorId,
    );

  if (conversacionExistente) {
    return {
      conversacionId:
        conversacionExistente,
    };
  }

  const conversacionId =
    await crearConversacionEnBaseDeDatos({
      articuloId,
      compradorId,
      vendedorId,
    });

  if (
    !Number.isInteger(
      conversacionId,
    ) ||
    conversacionId <= 0
  ) {
    throw new Error(
      "No se pudo crear la conversación",
    );
  }

  return {
    conversacionId,
  };
}

export async function obtenerConversaciones(
  usuarioId: number,
): Promise<Conversacion[]> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  return obtenerConversacionesDeUsuarioEnBaseDeDatos(
    usuarioId,
  );
}

export async function obtenerMensajes(
  conversacionId: number,
  usuarioId: number,
): Promise<Mensaje[]> {
  validarIdentificador(
    conversacionId,
    "conversación",
  );

  validarIdentificador(
    usuarioId,
    "usuario",
  );

  const conversacion =
    await obtenerConversacionPorIdEnBaseDeDatos(
      conversacionId,
    );

  if (!conversacion) {
    throw new Error(
      "La conversación indicada no existe",
    );
  }

  if (
    !usuarioPerteneceAConversacion(
      usuarioId,
      conversacion,
    )
  ) {
    throw new Error(
      "No tienes permiso para ver esta conversación",
    );
  }

  await marcarMensajesComoLeidosEnBaseDeDatos(
    conversacionId,
    usuarioId,
  );

  return obtenerMensajesDeConversacionEnBaseDeDatos(
    conversacionId,
  );
}

export async function enviarMensaje(
  conversacionId: number,
  remitenteId: number,
  contenido: unknown,
): Promise<{
  mensajeId: number;
}> {
  validarIdentificador(
    conversacionId,
    "conversación",
  );

  validarIdentificador(
    remitenteId,
    "remitente",
  );

  const contenidoLimpio =
    limpiarContenido(
      contenido,
    );

  const conversacion =
    await obtenerConversacionPorIdEnBaseDeDatos(
      conversacionId,
    );

  if (!conversacion) {
    throw new Error(
      "La conversación indicada no existe",
    );
  }

  if (
    !usuarioPerteneceAConversacion(
      remitenteId,
      conversacion,
    )
  ) {
    throw new Error(
      "No tienes permiso para enviar mensajes en esta conversación",
    );
  }

  const mensajeId =
    await crearMensajeEnBaseDeDatos({
      conversacionId,
      remitenteId,
      contenido:
        contenidoLimpio,
    });

  if (
    !Number.isInteger(
      mensajeId,
    ) ||
    mensajeId <= 0
  ) {
    throw new Error(
      "No se pudo enviar el mensaje",
    );
  }

  const destinatarioId =
    Number(
      conversacion.comprador_id,
    ) === remitenteId
      ? Number(
          conversacion.vendedor_id,
        )
      : Number(
          conversacion.comprador_id,
        );

  try {
    await crearNotificacion({
      usuarioId:
        destinatarioId,
      tipo: "mensaje_nuevo",
      titulo: "Nuevo mensaje",
      mensaje:
        contenidoLimpio.length > 120
          ? `${contenidoLimpio.slice(
              0,
              117,
            )}...`
          : contenidoLimpio,
      enlace:
        `/mensajes?conversacion=${conversacionId}`,
    });
  } catch (error) {
    console.error(
      "No se pudo crear la notificación del mensaje:",
      error,
    );
  }

  return {
    mensajeId,
  };
}