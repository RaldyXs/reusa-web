import {
  Image as ImageIcon,
  MessageSquare,
  Send,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import {
  enviarMensaje,
  obtenerConversaciones,
  obtenerMensajes,
  type Conversacion,
  type Mensaje,
} from "../services/mensajeService";

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

          setConversaciones(
            datos,
          );

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
          setCargandoMensajes(
            true,
          );

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
          setCargandoMensajes(
            false,
          );
        }
      },
      [
        conversacionSeleccionadaId,
      ],
    );

  useEffect(() => {
  const temporizador = window.setTimeout(() => {
    void cargarConversaciones();
  }, 0);

  return () => {
    window.clearTimeout(temporizador);
  };
}, [cargarConversaciones]);

useEffect(() => {
  if (!conversacionSeleccionadaId) {
    return;
  }

  const temporizador = window.setTimeout(() => {
    void cargarMensajes();
  }, 0);

  return () => {
    window.clearTimeout(temporizador);
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

    setError("");
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

    if (!contenido) {
      setError(
        "Escribe un mensaje antes de enviarlo",
      );

      return;
    }

    try {
      setEnviandoMensaje(
        true,
      );

      setError("");

      await enviarMensaje(
        conversacionSeleccionadaId,
        contenido,
      );

      setNuevoMensaje("");

      await cargarMensajes();
      await cargarConversaciones();
    } catch (
      errorDesconocido
    ) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo enviar el mensaje";

      setError(mensaje);
    } finally {
      setEnviandoMensaje(
        false,
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

                  return (
                    <button
                      className={`messages-conversation-item${
                        seleccionada
                          ? " messages-conversation-item--active"
                          : ""
                      }`}
                      type="button"
                      key={
                        conversacion.conversacion_id
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

                      return (
                        <article
                          className={`messages-bubble${
                            esPropio
                              ? " messages-bubble--own"
                              : ""
                          }`}
                          key={
                            mensaje.mensaje_id
                          }
                        >
                          <div>
                            {!esPropio && (
                              <strong>
                                {mensaje.remitente_nombre ??
                                  "Usuario"}
                              </strong>
                            )}

                            <p>
                              {
                                mensaje.contenido
                              }
                            </p>

                            <small>
                              {formatearFecha(
                                mensaje.fecha_envio,
                              )}
                            </small>
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
                <textarea
                  rows={2}
                  maxLength={1000}
                  placeholder="Escribe un mensaje..."
                  value={nuevoMensaje}
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
              </form>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

export default Messages;