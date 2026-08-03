import {
  solicitarApi,
} from "./apiService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (
    import.meta.env.PROD
      ? "https://reusa-backend.onrender.com/api"
      : "http://localhost:3000/api"
  );

const API_URL =
  `${API_BASE_URL}/mensajes`;

export type TipoMensaje =
  | "texto"
  | "imagen";

export interface Conversacion {
  conversacion_id: number;
  articulo_id: number;
  comprador_id: number;
  vendedor_id: number;
  fecha_creacion: string;
  fecha_actualizacion: string;

  articulo_titulo?: string;
  imagen_principal?: string | null;

  otro_usuario_id?: number;
  otro_usuario_nombre?: string;

  ultimo_mensaje?: string | null;
  fecha_ultimo_mensaje?: string | null;

  mensajes_no_leidos?:
    | number
    | string;
}

export interface Mensaje {
  mensaje_id: number;
  conversacion_id: number;
  remitente_id: number;

  contenido: string;
  tipo: TipoMensaje;
  url_imagen: string | null;

  editado: number | boolean;
  eliminado: number | boolean;
  leido: number | boolean;

  fecha_envio: string;
  fecha_edicion: string | null;

  remitente_nombre?: string;
}

interface RespuestaConversacion {
  ok: boolean;
  message?: string;

  conversacion?: {
    conversacionId: number;
  };
}

interface RespuestaConversaciones {
  ok: boolean;
  message?: string;
  conversaciones?: Conversacion[];
}

interface RespuestaMensajes {
  ok: boolean;
  message?: string;
  mensajes?: Mensaje[];
}

interface RespuestaMensaje {
  ok: boolean;
  message?: string;

  mensaje?: {
    mensajeId: number;
  };
}

interface RespuestaGenerica {
  ok: boolean;
  message?: string;
}

export async function crearOObtenerConversacion(
  articuloId: number,
): Promise<number> {
  const respuesta =
    await solicitarApi<RespuestaConversacion>(
      `${API_URL}/conversaciones`,
      {
        method: "POST",

        body: JSON.stringify({
          articuloId,
        }),
      },
      true,
    );

  const conversacionId = Number(
    respuesta.conversacion?.conversacionId,
  );

  if (
    !respuesta.ok ||
    !Number.isInteger(conversacionId) ||
    conversacionId <= 0
  ) {
    throw new Error(
      respuesta.message ??
        "No se pudo iniciar la conversación",
    );
  }

  return conversacionId;
}

export async function obtenerConversaciones(): Promise<
  Conversacion[]
> {
  const respuesta =
    await solicitarApi<RespuestaConversaciones>(
      `${API_URL}/conversaciones`,
      {
        method: "GET",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudieron obtener las conversaciones",
    );
  }

  return Array.isArray(
    respuesta.conversaciones,
  )
    ? respuesta.conversaciones
    : [];
}

export async function obtenerMensajes(
  conversacionId: number,
): Promise<Mensaje[]> {
  const respuesta =
    await solicitarApi<RespuestaMensajes>(
      `${API_URL}/conversaciones/${conversacionId}`,
      {
        method: "GET",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudieron obtener los mensajes",
    );
  }

  return Array.isArray(
    respuesta.mensajes,
  )
    ? respuesta.mensajes.map(
        (mensaje) => ({
          ...mensaje,

          editado: Number(
            mensaje.editado ?? 0,
          ),

          eliminado: Number(
            mensaje.eliminado ?? 0,
          ),

          leido: Number(
            mensaje.leido ?? 0,
          ),

          tipo:
            mensaje.tipo ??
            "texto",

          url_imagen:
            mensaje.url_imagen ??
            null,

          fecha_edicion:
            mensaje.fecha_edicion ??
            null,
        }),
      )
    : [];
}

export async function enviarMensaje(
  conversacionId: number,
  contenido: string,
): Promise<number> {
  const respuesta =
    await solicitarApi<RespuestaMensaje>(
      `${API_URL}/conversaciones/${conversacionId}`,
      {
        method: "POST",

        body: JSON.stringify({
          contenido,
          tipo: "texto",
          urlImagen: null,
        }),
      },
      true,
    );

  const mensajeId = Number(
    respuesta.mensaje?.mensajeId,
  );

  if (
    !respuesta.ok ||
    !Number.isInteger(mensajeId) ||
    mensajeId <= 0
  ) {
    throw new Error(
      respuesta.message ??
        "No se pudo enviar el mensaje",
    );
  }

  return mensajeId;
}

export async function enviarImagenMensaje(
  conversacionId: number,
  imagen: File,
  contenido = "",
): Promise<number> {
  const formulario =
    new FormData();

  formulario.append(
    "imagen",
    imagen,
  );

  formulario.append(
    "contenido",
    contenido.trim(),
  );

  formulario.append(
    "tipo",
    "imagen",
  );

  const respuesta =
    await solicitarApi<RespuestaMensaje>(
      `${API_URL}/conversaciones/${conversacionId}`,
      {
        method: "POST",
        body: formulario,
      },
      true,
    );

  const mensajeId = Number(
    respuesta.mensaje?.mensajeId,
  );

  if (
    !respuesta.ok ||
    !Number.isInteger(mensajeId) ||
    mensajeId <= 0
  ) {
    throw new Error(
      respuesta.message ??
        "No se pudo enviar la imagen",
    );
  }

  return mensajeId;
}

export async function editarMensaje(
  mensajeId: number,
  contenido: string,
): Promise<void> {
  const respuesta =
    await solicitarApi<RespuestaGenerica>(
      `${API_URL}/${mensajeId}`,
      {
        method: "PATCH",

        body: JSON.stringify({
          contenido,
        }),
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudo editar el mensaje",
    );
  }
}

export async function eliminarMensaje(
  mensajeId: number,
): Promise<void> {
  const respuesta =
    await solicitarApi<RespuestaGenerica>(
      `${API_URL}/${mensajeId}`,
      {
        method: "DELETE",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudo eliminar el mensaje",
    );
  }
}

export async function eliminarConversacion(
  conversacionId: number,
): Promise<void> {
  const respuesta =
    await solicitarApi<RespuestaGenerica>(
      `${API_URL}/conversaciones/${conversacionId}`,
      {
        method: "DELETE",
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudo eliminar la conversación",
    );
  }
}