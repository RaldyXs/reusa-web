import type {
  Conversacion,
  Mensaje,
  TipoMensaje,
} from "../models/mensaje.model.js";

import {
  actualizarMensajeEnBaseDeDatos,
  buscarConversacionExistenteEnBaseDeDatos,
  crearConversacionEnBaseDeDatos,
  crearMensajeEnBaseDeDatos,
  eliminarConversacionParaUsuarioEnBaseDeDatos,
  eliminarMensajeEnBaseDeDatos,
  marcarMensajesComoLeidosEnBaseDeDatos,
  obtenerConversacionPorIdEnBaseDeDatos,
  obtenerConversacionesDeUsuarioEnBaseDeDatos,
  obtenerMensajePorIdEnBaseDeDatos,
  obtenerMensajesDeConversacionEnBaseDeDatos,
  restaurarConversacionParaUsuarioEnBaseDeDatos,
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

  if (
    contenidoLimpio.length >
    1000
  ) {
    throw new Error(
      "El mensaje no puede superar los 1000 caracteres",
    );
  }

  return contenidoLimpio;
}

function limpiarContenidoOpcional(
  contenido: unknown,
): string {
  if (
    contenido === undefined ||
    contenido === null
  ) {
    return "";
  }

  if (typeof contenido !== "string") {
    throw new Error(
      "El contenido del mensaje no es válido",
    );
  }

  const contenidoLimpio =
    contenido.trim();

  if (
    contenidoLimpio.length >
    1000
  ) {
    throw new Error(
      "El mensaje no puede superar los 1000 caracteres",
    );
  }

  return contenidoLimpio;
}

function validarTipoMensaje(
  tipo: unknown,
): TipoMensaje {
  if (
    tipo === undefined ||
    tipo === null ||
    tipo === ""
  ) {
    return "texto";
  }

  if (
    tipo !== "texto" &&
    tipo !== "imagen"
  ) {
    throw new Error(
      "El tipo de mensaje no es válido",
    );
  }

  return tipo;
}

function limpiarUrlImagen(
  urlImagen: unknown,
): string | null {
  if (
    urlImagen === undefined ||
    urlImagen === null ||
    urlImagen === ""
  ) {
    return null;
  }

  if (
    typeof urlImagen !== "string"
  ) {
    throw new Error(
      "La imagen del mensaje no es válida",
    );
  }

  const urlLimpia =
    urlImagen.trim();

  if (!urlLimpia) {
    return null;
  }

  if (urlLimpia.length > 500) {
    throw new Error(
      "La dirección de la imagen es demasiado larga",
    );
  }

  const esRutaLocal =
    urlLimpia.startsWith(
      "/uploads/",
    );

  const esUrlHttp =
    urlLimpia.startsWith(
      "http://",
    ) ||
    urlLimpia.startsWith(
      "https://",
    );

  if (
    !esRutaLocal &&
    !esUrlHttp
  ) {
    throw new Error(
      "La dirección de la imagen no es válida",
    );
  }

  return urlLimpia;
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

function obtenerDestinatarioId(
  remitenteId: number,
  conversacion: {
    comprador_id: number;
    vendedor_id: number;
  },
): number {
  return Number(
    conversacion.comprador_id,
  ) === remitenteId
    ? Number(
        conversacion.vendedor_id,
      )
    : Number(
        conversacion.comprador_id,
      );
}

function crearResumenNotificacion(
  tipo: TipoMensaje,
  contenido: string,
): string {
  if (tipo === "imagen") {
    if (!contenido) {
      return "Te envió una imagen";
    }

    return contenido.length > 120
      ? `Imagen: ${contenido.slice(
          0,
          109,
        )}...`
      : `Imagen: ${contenido}`;
  }

  return contenido.length > 120
    ? `${contenido.slice(
        0,
        117,
      )}...`
    : contenido;
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

  if (
    vendedorId === compradorId
  ) {
    throw new Error(
      "No puedes iniciar una conversación contigo mismo",
    );
  }

  if (
    Number(
      articulo.eliminado ?? 0,
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
    await restaurarConversacionParaUsuarioEnBaseDeDatos(
      conversacionExistente,
      compradorId,
    );

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
  tipoMensaje: unknown = "texto",
  urlImagen: unknown = null,
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

  const tipo =
    validarTipoMensaje(
      tipoMensaje,
    );

  const imagenLimpia =
    limpiarUrlImagen(
      urlImagen,
    );

  let contenidoLimpio = "";

  if (tipo === "texto") {
    contenidoLimpio =
      limpiarContenido(
        contenido,
      );

    if (imagenLimpia) {
      throw new Error(
        "Un mensaje de texto no puede contener una imagen",
      );
    }
  } else {
    contenidoLimpio =
      limpiarContenidoOpcional(
        contenido,
      );

    if (!imagenLimpia) {
      throw new Error(
        "Debes seleccionar una imagen",
      );
    }
  }

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
      tipo,
      urlImagen:
        imagenLimpia,
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
    obtenerDestinatarioId(
      remitenteId,
      conversacion,
    );

  try {
    await crearNotificacion({
      usuarioId:
        destinatarioId,
      tipo: "mensaje_nuevo",
      titulo: "Nuevo mensaje",
      mensaje:
        crearResumenNotificacion(
          tipo,
          contenidoLimpio,
        ),
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

export async function editarMensaje(
  mensajeId: number,
  usuarioId: number,
  contenido: unknown,
): Promise<void> {
  validarIdentificador(
    mensajeId,
    "mensaje",
  );

  validarIdentificador(
    usuarioId,
    "usuario",
  );

  const contenidoLimpio =
    limpiarContenido(
      contenido,
    );

  const mensaje =
    await obtenerMensajePorIdEnBaseDeDatos(
      mensajeId,
    );

  if (!mensaje) {
    throw new Error(
      "El mensaje indicado no existe",
    );
  }

  if (
    Number(
      mensaje.remitente_id,
    ) !== usuarioId
  ) {
    throw new Error(
      "No tienes permiso para editar este mensaje",
    );
  }

  if (
    Number(
      mensaje.eliminado,
    ) === 1
  ) {
    throw new Error(
      "No puedes editar un mensaje eliminado",
    );
  }

  if (
    mensaje.tipo !== "texto"
  ) {
    throw new Error(
      "Solo se pueden editar mensajes de texto",
    );
  }

  if (
    mensaje.contenido.trim() ===
    contenidoLimpio
  ) {
    throw new Error(
      "El nuevo contenido debe ser diferente",
    );
  }

  const actualizado =
    await actualizarMensajeEnBaseDeDatos(
      mensajeId,
      usuarioId,
      contenidoLimpio,
    );

  if (!actualizado) {
    throw new Error(
      "No se pudo editar el mensaje",
    );
  }
}

export async function eliminarMensaje(
  mensajeId: number,
  usuarioId: number,
): Promise<void> {
  validarIdentificador(
    mensajeId,
    "mensaje",
  );

  validarIdentificador(
    usuarioId,
    "usuario",
  );

  const mensaje =
    await obtenerMensajePorIdEnBaseDeDatos(
      mensajeId,
    );

  if (!mensaje) {
    throw new Error(
      "El mensaje indicado no existe",
    );
  }

  if (
    Number(
      mensaje.remitente_id,
    ) !== usuarioId
  ) {
    throw new Error(
      "No tienes permiso para eliminar este mensaje",
    );
  }

  if (
    Number(
      mensaje.eliminado,
    ) === 1
  ) {
    throw new Error(
      "El mensaje ya fue eliminado",
    );
  }

  const eliminado =
    await eliminarMensajeEnBaseDeDatos(
      mensajeId,
      usuarioId,
    );

  if (!eliminado) {
    throw new Error(
      "No se pudo eliminar el mensaje",
    );
  }
}

export async function eliminarConversacion(
  conversacionId: number,
  usuarioId: number,
): Promise<void> {
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
      "No tienes permiso para eliminar esta conversación",
    );
  }

  const eliminada =
    await eliminarConversacionParaUsuarioEnBaseDeDatos(
      conversacionId,
      usuarioId,
    );

  if (!eliminada) {
    throw new Error(
      "No se pudo eliminar la conversación",
    );
  }
}