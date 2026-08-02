import {
  Image as ImageIcon,
  MessageSquare,
  Paperclip,
  Pencil,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import {
  editarMensaje,
  eliminarConversacion,
  eliminarMensaje,
  enviarImagenMensaje,
  enviarMensaje,
  obtenerConversaciones,
  obtenerMensajes,
  type Conversacion,
  type Mensaje,
} from "../services/mensajeService";

const EVENTO_MENSAJES_ACTUALIZADOS =
  "reusa-mensajes-actualizados";

const TIPOS_IMAGEN_PERMITIDOS =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const TAMANO_MAXIMO_IMAGEN =
  5 * 1024 * 1024;

function notificarActualizacionMensajes(): void {
  window.dispatchEvent(
    new CustomEvent(
      EVENTO_MENSAJES_ACTUALIZADOS,
    ),
  );
}

function formatearFecha(
  fecha: string | null | undefined,
): string {
  if (!fecha) {
    return "";
  }

  const fechaConvertida =
    new Date(fecha);

  if (
    Number.isNaN(
      fechaConvertida.getTime(),
    )
  ) {
    return "";
  }

  return fechaConvertida.toLocaleString(
    "es-DO",
    {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function Messages() {
  const { usuario } = useAuth();

  const [
    parametrosBusqueda,
    setParametrosBusqueda,
  ] = useSearchParams();

  const [
    conversaciones,
    setConversaciones,
  ] = useState<Conversacion[]>([]);

  const [
    mensajes,
    setMensajes,
  ] = useState<Mensaje[]>([]);

  const [
    conversacionSeleccionadaId,
    setConversacionSeleccionadaId,
  ] = useState<number | null>(null);

  const [
    nuevoMensaje,
    setNuevoMensaje,
  ] = useState("");

  const [
    imagenSeleccionada,
    setImagenSeleccionada,
  ] = useState<File | null>(null);

  const [
    vistaPreviaImagen,
    setVistaPreviaImagen,
  ] = useState<string | null>(null);

  const [
    mensajeEditandoId,
    setMensajeEditandoId,
  ] = useState<number | null>(null);

  const [
    contenidoEdicion,
    setContenidoEdicion,
  ] = useState("");

  const [
    mensajeProcesandoId,
    setMensajeProcesandoId,
  ] = useState<number | null>(null);

  const [
    conversacionProcesandoId,
    setConversacionProcesandoId,
  ] = useState<number | null>(null);

  const [
    cargandoConversaciones,
    setCargandoConversaciones,
  ] = useState(true);

  const [
    cargandoMensajes,
    setCargandoMensajes,
  ] = useState(false);

  const [
    enviandoMensaje,
    setEnviandoMensaje,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const limpiarImagenSeleccionada =
    useCallback((): void => {
      setImagenSeleccionada(null);
      setVistaPreviaImagen(null);
    }, []);

  const cargarConversaciones =
    useCallback(
      async (): Promise<void> => {
        try {
          setCargandoConversaciones(
            true,
          );

          setError("");

          const datos =
            await obtenerConversaciones();

          setConversaciones(datos);

          const conversacionDesdeUrl =
            Number(
              parametrosBusqueda.get(
                "conversacion",
              ),
            );

          const existeConversacionUrl =
            Number.isInteger(
              conversacionDesdeUrl,
            ) &&
            conversacionDesdeUrl > 0 &&
            datos.some(
              (conversacion) =>
                conversacion.conversacion_id ===
                conversacionDesdeUrl,
            );

          if (
            existeConversacionUrl
          ) {
            setConversacionSeleccionadaId(
              conversacionDesdeUrl,
            );

            return;
          }

          if (
            conversacionSeleccionadaId &&
            datos.some(
              (conversacion) =>
                conversacion.conversacion_id ===
                conversacionSeleccionadaId,
            )
          ) {
            return;
          }

          setConversacionSeleccionadaId(
            datos[0]
              ?.conversacion_id ??
              null,
          );
        } catch (
          errorDesconocido
        ) {
          const mensaje =
            errorDesconocido instanceof Error
              ? errorDesconocido.message
              : "No se pudieron cargar las conversaciones";

          setError(mensaje);
          setConversaciones([]);
          setConversacionSeleccionadaId(
            null,
          );
        } finally {
          setCargandoConversaciones(
            false,
          );
        }
      },
      [
        conversacionSeleccionadaId,
        parametrosBusqueda,
      ],
    );

  const cargarMensajes =
    useCallback(
      async (): Promise<void> => {
        if (
          !conversacionSeleccionadaId
        ) {
          setMensajes([]);

          return;
        }

        try {
          setCargandoMensajes(true);
          setError("");

          const datos =
            await obtenerMensajes(
              conversacionSeleccionadaId,
            );

          setMensajes(datos);

          setConversaciones(
            (
              conversacionesActuales,
            ) =>
              conversacionesActuales.map(
                (
                  conversacion,
                ) =>
                  conversacion.conversacion_id ===
                  conversacionSeleccionadaId
                    ? {
                        ...conversacion,
                        mensajes_no_leidos:
                          0,
                      }
                    : conversacion,
              ),
          );

          notificarActualizacionMensajes();
        } catch (
          errorDesconocido
        ) {
          const mensaje =
            errorDesconocido instanceof Error
              ? errorDesconocido.message
              : "No se pudieron cargar los mensajes";

          setError(mensaje);
          setMensajes([]);
        } finally {
          setCargandoMensajes(false);
        }
      },
      [
        conversacionSeleccionadaId,
      ],
    );

  useEffect(() => {
    const temporizador =
      window.setTimeout(() => {
        void cargarConversaciones();
      }, 0);

    return () => {
      window.clearTimeout(
        temporizador,
      );
    };
  }, [cargarConversaciones]);

  useEffect(() => {
    if (
      !conversacionSeleccionadaId
    ) {
      return;
    }

    const temporizador =
      window.setTimeout(() => {
        void cargarMensajes();
      }, 0);

    return () => {
      window.clearTimeout(
        temporizador,
      );
    };
  }, [
    cargarMensajes,
    conversacionSeleccionadaId,
  ]);

  const conversacionSeleccionada =
    useMemo(
      () =>
        conversaciones.find(
          (conversacion) =>
            conversacion.conversacion_id ===
            conversacionSeleccionadaId,
        ) ?? null,
      [
        conversaciones,
        conversacionSeleccionadaId,
      ],
    );

  function seleccionarConversacion(
    conversacionId: number,
  ): void {
    setConversacionSeleccionadaId(
      conversacionId,
    );

    setParametrosBusqueda({
      conversacion:
        String(conversacionId),
    });

    setMensajeEditandoId(null);
    setContenidoEdicion("");
    setNuevoMensaje("");
    limpiarImagenSeleccionada();
    setError("");
  }

  function manejarSeleccionImagen(
    evento: ChangeEvent<HTMLInputElement>,
  ): void {
    const archivo =
      evento.target.files?.[0];

    evento.target.value = "";

    if (!archivo) {
      return;
    }

    if (
      !TIPOS_IMAGEN_PERMITIDOS.has(
        archivo.type,
      )
    ) {
      setError(
        "Solo se permiten imágenes JPG, PNG o WEBP",
      );

      return;
    }

    if (
      archivo.size >
      TAMANO_MAXIMO_IMAGEN
    ) {
      setError(
        "La imagen no puede superar los 5 MB",
      );

      return;
    }

    limpiarImagenSeleccionada();

    const lector =
      new FileReader();

    lector.onload = () => {
      const resultado =
        lector.result;

      if (
        typeof resultado !==
        "string"
      ) {
        setError(
          "No se pudo generar la vista previa de la imagen",
        );

        return;
      }

      setImagenSeleccionada(
        archivo,
      );

      setVistaPreviaImagen(
        resultado,
      );

      setError("");
    };

    lector.onerror = () => {
      setImagenSeleccionada(null);
      setVistaPreviaImagen(null);

      setError(
        "No se pudo leer la imagen seleccionada",
      );
    };

    lector.readAsDataURL(
      archivo,
    );
  }

  async function manejarEnvio(
    evento: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    evento.preventDefault();

    if (
      !conversacionSeleccionadaId
    ) {
      return;
    }

    const contenido =
      nuevoMensaje.trim();

    if (
      !contenido &&
      !imagenSeleccionada
    ) {
      setError(
        "Escribe un mensaje o selecciona una imagen",
      );

      return;
    }

    try {
      setEnviandoMensaje(true);
      setError("");

      if (imagenSeleccionada) {
        await enviarImagenMensaje(
          conversacionSeleccionadaId,
          imagenSeleccionada,
          contenido,
        );
      } else {
        await enviarMensaje(
          conversacionSeleccionadaId,
          contenido,
        );
      }

      setNuevoMensaje("");
      limpiarImagenSeleccionada();

      await cargarMensajes();
      await cargarConversaciones();

      notificarActualizacionMensajes();
    } catch (
      errorDesconocido
    ) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo enviar el mensaje";

      setError(mensaje);
    } finally {
      setEnviandoMensaje(false);
    }
  }

  function comenzarEdicion(
    mensaje: Mensaje,
  ): void {
    setMensajeEditandoId(
      mensaje.mensaje_id,
    );

    setContenidoEdicion(
      mensaje.contenido,
    );

    setError("");
  }

  function cancelarEdicion(): void {
    setMensajeEditandoId(null);
    setContenidoEdicion("");
  }

  async function guardarEdicion(
    mensajeId: number,
  ): Promise<void> {
    const contenido =
      contenidoEdicion.trim();

    if (!contenido) {
      setError(
        "El mensaje no puede estar vacío",
      );

      return;
    }

    try {
      setMensajeProcesandoId(
        mensajeId,
      );

      setError("");

      await editarMensaje(
        mensajeId,
        contenido,
      );

      cancelarEdicion();

      await cargarMensajes();
      await cargarConversaciones();

      notificarActualizacionMensajes();
    } catch (
      errorDesconocido
    ) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo editar el mensaje";

      setError(mensaje);
    } finally {
      setMensajeProcesandoId(null);
    }
  }

  async function manejarEliminarMensaje(
    mensajeId: number,
  ): Promise<void> {
    const confirmado =
      window.confirm(
        "¿Seguro que deseas eliminar este mensaje?",
      );

    if (!confirmado) {
      return;
    }

    try {
      setMensajeProcesandoId(
        mensajeId,
      );

      setError("");

      await eliminarMensaje(
        mensajeId,
      );

      if (
        mensajeEditandoId ===
        mensajeId
      ) {
        cancelarEdicion();
      }

      await cargarMensajes();
      await cargarConversaciones();

      notificarActualizacionMensajes();
    } catch (
      errorDesconocido
    ) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo eliminar el mensaje";

      setError(mensaje);
    } finally {
      setMensajeProcesandoId(null);
    }
  }

  async function manejarEliminarConversacion(
    conversacionId: number,
  ): Promise<void> {
    const confirmado =
      window.confirm(
        "¿Seguro que deseas eliminar esta conversación de tu lista?",
      );

    if (!confirmado) {
      return;
    }

    try {
      setConversacionProcesandoId(
        conversacionId,
      );

      setError("");

      await eliminarConversacion(
        conversacionId,
      );

      const conversacionesRestantes =
        conversaciones.filter(
          (conversacion) =>
            conversacion.conversacion_id !==
            conversacionId,
        );

      setConversaciones(
        conversacionesRestantes,
      );

      if (
        conversacionSeleccionadaId ===
        conversacionId
      ) {
        const siguienteConversacionId =
          conversacionesRestantes[0]
            ?.conversacion_id ??
          null;

        setConversacionSeleccionadaId(
          siguienteConversacionId,
        );

        setMensajes([]);
        setMensajeEditandoId(null);
        setContenidoEdicion("");
        setNuevoMensaje("");
        limpiarImagenSeleccionada();

        if (siguienteConversacionId) {
          setParametrosBusqueda({
            conversacion:
              String(
                siguienteConversacionId,
              ),
          });
        } else {
          setParametrosBusqueda({});
        }
      }

      notificarActualizacionMensajes();
    } catch (
      errorDesconocido
    ) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo eliminar la conversación";

      setError(mensaje);
    } finally {
      setConversacionProcesandoId(
        null,
      );
    }
  }

  return (
    <section className="messages-page">
      <header className="messages-page__header">
        <div>
          <span>Mi cuenta</span>

          <h1>Mensajes</h1>

          <p>
            Conversa con compradores
            y vendedores sobre las
            publicaciones.
          </p>
        </div>
      </header>

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="messages-layout">
        <aside className="messages-sidebar">
          <header className="messages-sidebar__header">
            <strong>
              Conversaciones
            </strong>

            <span>
              {conversaciones.length}
            </span>
          </header>

          {cargandoConversaciones ? (
            <p className="status-message">
              Cargando conversaciones...
            </p>
          ) : conversaciones.length ===
            0 ? (
            <div className="messages-empty">
              <MessageSquare
                size={30}
              />

              <strong>
                No tienes conversaciones
              </strong>

              <span>
                Inicia una desde el
                detalle de un producto.
              </span>
            </div>
          ) : (
            <div className="messages-conversation-list">
              {conversaciones.map(
                (conversacion) => {
                  const seleccionada =
                    conversacion.conversacion_id ===
                    conversacionSeleccionadaId;

                  const noLeidos =
                    Number(
                      conversacion.mensajes_no_leidos ??
                        0,
                    );

                  const procesandoConversacion =
                    conversacionProcesandoId ===
                    conversacion.conversacion_id;

                  return (
                    <div
                      className="messages-conversation-row"
                      key={
                        conversacion.conversacion_id
                      }
                    >
                      <button
                        className={`messages-conversation-item${
                          seleccionada
                            ? " messages-conversation-item--active"
                            : ""
                        }`}
                        type="button"
                        disabled={
                          procesandoConversacion
                        }
                        onClick={() =>
                          seleccionarConversacion(
                            conversacion.conversacion_id,
                          )
                        }
                      >
                        <span className="messages-conversation-image">
                          {conversacion.imagen_principal ? (
                            <img
                              src={
                                conversacion.imagen_principal
                              }
                              alt={
                                conversacion.articulo_titulo ??
                                "Artículo"
                              }
                            />
                          ) : (
                            <ImageIcon
                              size={19}
                            />
                          )}
                        </span>

                        <span className="messages-conversation-content">
                          <strong>
                            {conversacion.otro_usuario_nombre ??
                              "Usuario"}
                          </strong>

                          <small>
                            {conversacion.articulo_titulo ??
                              "Publicación"}
                          </small>

                          <span>
                            {conversacion.ultimo_mensaje ??
                              "Conversación iniciada"}
                          </span>
                        </span>

                        <span className="messages-conversation-meta">
                          <small>
                            {formatearFecha(
                              conversacion.fecha_ultimo_mensaje ??
                                conversacion.fecha_actualizacion,
                            )}
                          </small>

                          {noLeidos > 0 && (
                            <strong>
                              {noLeidos > 99
                                ? "99+"
                                : noLeidos}
                            </strong>
                          )}
                        </span>
                      </button>

                      <button
                        className="messages-conversation-delete"
                        type="button"
                        aria-label="Eliminar conversación"
                        title="Eliminar conversación"
                        disabled={
                          procesandoConversacion
                        }
                        onClick={() =>
                          void manejarEliminarConversacion(
                            conversacion.conversacion_id,
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </aside>

        <section className="messages-chat">
          {!conversacionSeleccionada ? (
            <div className="messages-empty messages-empty--chat">
              <MessageSquare
                size={36}
              />

              <strong>
                Selecciona una conversación
              </strong>

              <span>
                Los mensajes aparecerán
                aquí.
              </span>
            </div>
          ) : (
            <>
              <header className="messages-chat__header">
                <span className="messages-chat__avatar">
                  <UserRound
                    size={18}
                  />
                </span>

                <div>
                  <strong>
                    {conversacionSeleccionada.otro_usuario_nombre ??
                      "Usuario"}
                  </strong>

                  <span>
                    {conversacionSeleccionada.articulo_titulo ??
                      "Publicación"}
                  </span>
                </div>
              </header>

              <div className="messages-chat__body">
                {cargandoMensajes ? (
                  <p className="status-message">
                    Cargando mensajes...
                  </p>
                ) : mensajes.length ===
                  0 ? (
                  <div className="messages-empty">
                    <MessageSquare
                      size={30}
                    />

                    <strong>
                      Inicia la conversación
                    </strong>

                    <span>
                      Escribe el primer
                      mensaje.
                    </span>
                  </div>
                ) : (
                  mensajes.map(
                    (mensaje) => {
                      const esPropio =
                        Number(
                          mensaje.remitente_id,
                        ) ===
                        Number(
                          usuario?.usuarioId,
                        );

                      const eliminado =
                        Number(
                          mensaje.eliminado ??
                            0,
                        ) === 1;

                      const editado =
                        Number(
                          mensaje.editado ??
                            0,
                        ) === 1;

                      const esImagen =
                        mensaje.tipo ===
                        "imagen";

                      const editando =
                        mensajeEditandoId ===
                        mensaje.mensaje_id;

                      const procesando =
                        mensajeProcesandoId ===
                        mensaje.mensaje_id;

                      return (
                        <article
                          className={`messages-bubble${
                            esPropio
                              ? " messages-bubble--own"
                              : ""
                          }${
                            eliminado
                              ? " messages-bubble--deleted"
                              : ""
                          }`}
                          key={
                            mensaje.mensaje_id
                          }
                        >
                          <div className="messages-bubble__content">
                            {!esPropio && (
                              <strong>
                                {mensaje.remitente_nombre ??
                                  "Usuario"}
                              </strong>
                            )}

                            {editando ? (
                              <div className="messages-edit-form">
                                <textarea
                                  rows={3}
                                  maxLength={1000}
                                  value={
                                    contenidoEdicion
                                  }
                                  onChange={(evento) =>
                                    setContenidoEdicion(
                                      evento.target.value,
                                    )
                                  }
                                />

                                <div className="messages-edit-actions">
                                  <button
                                    type="button"
                                    disabled={
                                      procesando
                                    }
                                    onClick={() =>
                                      void guardarEdicion(
                                        mensaje.mensaje_id,
                                      )
                                    }
                                  >
                                    Guardar
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      procesando
                                    }
                                    onClick={
                                      cancelarEdicion
                                    }
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {!eliminado &&
                                  esImagen &&
                                  mensaje.url_imagen && (
                                    <a
                                      className="messages-bubble__image-link"
                                      href={
                                        mensaje.url_imagen
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <img
                                        className="messages-bubble__image"
                                        src={
                                          mensaje.url_imagen
                                        }
                                        alt="Imagen enviada en la conversación"
                                      />
                                    </a>
                                  )}

                                {mensaje.contenido && (
                                  <p>
                                    {
                                      mensaje.contenido
                                    }
                                  </p>
                                )}

                                <div className="messages-bubble__meta">
                                  <small>
                                    {formatearFecha(
                                      mensaje.fecha_envio,
                                    )}

                                    {editado &&
                                      !eliminado &&
                                      " · Editado"}
                                  </small>

                                  {esPropio &&
                                    !eliminado && (
                                      <div className="messages-bubble__actions">
                                        {!esImagen && (
                                          <button
                                            type="button"
                                            aria-label="Editar mensaje"
                                            title="Editar mensaje"
                                            disabled={
                                              procesando
                                            }
                                            onClick={() =>
                                              comenzarEdicion(
                                                mensaje,
                                              )
                                            }
                                          >
                                            <Pencil
                                              size={14}
                                            />
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          aria-label="Eliminar mensaje"
                                          title="Eliminar mensaje"
                                          disabled={
                                            procesando
                                          }
                                          onClick={() =>
                                            void manejarEliminarMensaje(
                                              mensaje.mensaje_id,
                                            )
                                          }
                                        >
                                          <Trash2
                                            size={14}
                                          />
                                        </button>
                                      </div>
                                    )}
                                </div>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    },
                  )
                )}
              </div>

              <form
                className="messages-chat__form"
                onSubmit={(evento) =>
                  void manejarEnvio(
                    evento,
                  )
                }
              >
                {vistaPreviaImagen && (
                  <div className="messages-image-preview">
                    <img
                      src={
                        vistaPreviaImagen
                      }
                      alt="Vista previa de la imagen seleccionada"
                    />

                    <div>
                      <strong>
                        {imagenSeleccionada?.name}
                      </strong>

                      <span>
                        Puedes agregar un
                        texto antes de
                        enviarla.
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label="Quitar imagen"
                      onClick={
                        limpiarImagenSeleccionada
                      }
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}

                <div className="messages-chat__composer">
                  <label
                    className="messages-attach-button"
                    title="Adjuntar imagen"
                  >
                    <Paperclip size={19} />

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={
                        enviandoMensaje
                      }
                      onChange={
                        manejarSeleccionImagen
                      }
                    />
                  </label>

                  <textarea
                    rows={2}
                    maxLength={1000}
                    placeholder={
                      imagenSeleccionada
                        ? "Agrega un texto opcional..."
                        : "Escribe un mensaje..."
                    }
                    value={nuevoMensaje}
                    disabled={
                      enviandoMensaje
                    }
                    onChange={(evento) =>
                      setNuevoMensaje(
                        evento.target.value,
                      )
                    }
                  />

                  <button
                    type="submit"
                    disabled={
                      enviandoMensaje
                    }
                  >
                    <Send size={17} />

                    {enviandoMensaje
                      ? "Enviando..."
                      : "Enviar"}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

export default Messages;