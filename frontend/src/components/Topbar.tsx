import {
  Bell,
  CheckCheck,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import {
  marcarNotificacionComoLeida,
  marcarTodasComoLeidas,
  obtenerCantidadNoLeidas,
  obtenerNotificaciones,
  type Notificacion,
} from "../services/notificacionService";

function formatearFechaNotificacion(
  fecha: string,
): string {
  const fechaNotificacion = new Date(fecha);

  if (
    Number.isNaN(
      fechaNotificacion.getTime(),
    )
  ) {
    return "";
  }

  return fechaNotificacion.toLocaleString(
    "es-DO",
    {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function Topbar() {
  const navigate = useNavigate();

  const {
    autenticado,
    usuario,
    logout,
  } = useAuth();

  const [
    terminoBusqueda,
    setTerminoBusqueda,
  ] = useState("");

  const [
    menuUsuarioAbierto,
    setMenuUsuarioAbierto,
  ] = useState(false);

  const [
    panelNotificacionesAbierto,
    setPanelNotificacionesAbierto,
  ] = useState(false);

  const [
    notificaciones,
    setNotificaciones,
  ] = useState<Notificacion[]>([]);

  const [
    cantidadNoLeidas,
    setCantidadNoLeidas,
  ] = useState(0);

  const [
    cargandoNotificaciones,
    setCargandoNotificaciones,
  ] = useState(false);

  const [
    errorNotificaciones,
    setErrorNotificaciones,
  ] = useState("");

  const cargarNotificaciones =
    useCallback(async (): Promise<void> => {
      if (!autenticado || !usuario) {
        return;
      }

      try {
        setCargandoNotificaciones(true);
        setErrorNotificaciones("");

        const datos =
          await obtenerNotificaciones();

        setNotificaciones(datos);

        const noLeidas = datos.filter(
          (notificacion) =>
            Number(
              notificacion.leida,
            ) === 0,
        ).length;

        setCantidadNoLeidas(noLeidas);
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar las notificaciones";

        setErrorNotificaciones(mensaje);
      } finally {
        setCargandoNotificaciones(false);
      }
    }, [autenticado, usuario]);

  useEffect(() => {
    if (!autenticado || !usuario) {
      return;
    }

    let componenteActivo = true;

    obtenerCantidadNoLeidas()
      .then((cantidad) => {
        if (componenteActivo) {
          setCantidadNoLeidas(cantidad);
        }
      })
      .catch((errorDesconocido) => {
        console.error(
          "No se pudo cargar el resumen de notificaciones:",
          errorDesconocido,
        );
      });

    return () => {
      componenteActivo = false;
    };
  }, [autenticado, usuario]);

  function manejarBusqueda(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    const terminoLimpio =
      terminoBusqueda.trim();

    if (!terminoLimpio) {
      navigate("/marketplace");
      return;
    }

    navigate(
      `/marketplace?busqueda=${encodeURIComponent(
        terminoLimpio,
      )}`,
    );
  }

  function cerrarSesion(): void {
    logout();

    setMenuUsuarioAbierto(false);
    setPanelNotificacionesAbierto(false);
    setNotificaciones([]);
    setCantidadNoLeidas(0);
    setErrorNotificaciones("");

    navigate("/", {
      replace: true,
    });
  }

  async function alternarNotificaciones(): Promise<void> {
    if (!autenticado || !usuario) {
      navigate("/login");
      return;
    }

    const nuevoEstado =
      !panelNotificacionesAbierto;

    setPanelNotificacionesAbierto(
      nuevoEstado,
    );

    setMenuUsuarioAbierto(false);

    if (nuevoEstado) {
      await cargarNotificaciones();
    }
  }

  async function abrirNotificacion(
    notificacion: Notificacion,
  ): Promise<void> {
    const estabaLeida =
      Number(
        notificacion.leida,
      ) === 1;

    try {
      setErrorNotificaciones("");

      if (!estabaLeida) {
        await marcarNotificacionComoLeida(
          notificacion.notificacion_id,
        );

        setNotificaciones(
          (notificacionesActuales) =>
            notificacionesActuales.map(
              (notificacionActual) =>
                notificacionActual.notificacion_id ===
                notificacion.notificacion_id
                  ? {
                      ...notificacionActual,
                      leida: true,
                    }
                  : notificacionActual,
            ),
        );

        setCantidadNoLeidas(
          (cantidadActual) =>
            Math.max(
              0,
              cantidadActual - 1,
            ),
        );
      }

      setPanelNotificacionesAbierto(
        false,
      );

      if (notificacion.enlace) {
        navigate(
          notificacion.enlace,
        );
      }
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo abrir la notificación";

      setErrorNotificaciones(mensaje);
    }
  }

  async function manejarMarcarTodasComoLeidas(): Promise<void> {
    try {
      setErrorNotificaciones("");

      await marcarTodasComoLeidas();

      setNotificaciones(
        (notificacionesActuales) =>
          notificacionesActuales.map(
            (notificacion) => ({
              ...notificacion,
              leida: true,
            }),
          ),
      );

      setCantidadNoLeidas(0);
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudieron marcar las notificaciones como leídas";

      setErrorNotificaciones(mensaje);
    }
  }

  const inicialUsuario =
    usuario?.nombre
      .trim()
      .charAt(0)
      .toUpperCase() ?? "U";

  return (
    <header className="topbar topbar--simple">
      <form
        className="topbar__search"
        role="search"
        onSubmit={manejarBusqueda}
      >
        <Search size={18} />

        <input
          type="search"
          placeholder="Buscar en Re-Usa..."
          aria-label="Buscar artículos"
          value={terminoBusqueda}
          onChange={(event) =>
            setTerminoBusqueda(
              event.target.value,
            )
          }
        />
      </form>

      <nav
        className="topbar__navigation"
        aria-label="Acciones del usuario"
      >
        <button
          className="topbar__icon-button"
          type="button"
          aria-label="Mensajes"
          title="Mensajes"
          onClick={() =>
            navigate("/mensajes")
          }
        >
          <MessageSquare size={19} />
        </button>

        <button
          className="topbar__icon-button"
          type="button"
          aria-label="Guardados"
          title="Guardados"
          onClick={() =>
            navigate("/guardados")
          }
        >
          <Heart size={19} />
        </button>

        <div className="topbar__notifications">
          <button
            className="topbar__icon-button topbar__notification-button"
            type="button"
            aria-label={
              cantidadNoLeidas > 0
                ? `Notificaciones, ${cantidadNoLeidas} sin leer`
                : "Notificaciones"
            }
            aria-expanded={
              panelNotificacionesAbierto
            }
            aria-haspopup="dialog"
            title="Notificaciones"
            onClick={() =>
              void alternarNotificaciones()
            }
          >
            <Bell size={19} />

            {cantidadNoLeidas > 0 && (
              <span className="topbar__notification-badge">
                {cantidadNoLeidas > 99
                  ? "99+"
                  : cantidadNoLeidas}
              </span>
            )}
          </button>

          {panelNotificacionesAbierto && (
            <section
              className="topbar__notification-panel"
              aria-label="Panel de notificaciones"
            >
              <header className="topbar__notification-header">
                <div>
                  <strong>
                    Notificaciones
                  </strong>

                  <span>
                    {cantidadNoLeidas} sin leer
                  </span>
                </div>

                {cantidadNoLeidas > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      void manejarMarcarTodasComoLeidas()
                    }
                  >
                    <CheckCheck size={15} />
                    Marcar todas
                  </button>
                )}
              </header>

              {errorNotificaciones && (
                <p
                  className="topbar__notification-error"
                  role="alert"
                >
                  {errorNotificaciones}
                </p>
              )}

              {cargandoNotificaciones ? (
                <p className="topbar__notification-status">
                  Cargando notificaciones...
                </p>
              ) : notificaciones.length ===
                0 ? (
                <p className="topbar__notification-status">
                  No tienes notificaciones.
                </p>
              ) : (
                <div className="topbar__notification-list">
                  {notificaciones.map(
                    (notificacion) => {
                      const leida =
                        Number(
                          notificacion.leida,
                        ) === 1;

                      return (
                        <button
                          className={`topbar__notification-item${
                            leida
                              ? ""
                              : " topbar__notification-item--unread"
                          }`}
                          type="button"
                          key={
                            notificacion.notificacion_id
                          }
                          onClick={() =>
                            void abrirNotificacion(
                              notificacion,
                            )
                          }
                        >
                          <span className="topbar__notification-icon">
                            <Bell size={16} />
                          </span>

                          <span className="topbar__notification-content">
                            <strong>
                              {
                                notificacion.titulo
                              }
                            </strong>

                            <span>
                              {
                                notificacion.mensaje
                              }
                            </span>

                            <small>
                              {formatearFechaNotificacion(
                                notificacion.fecha_creacion,
                              )}
                            </small>
                          </span>

                          {!leida && (
                            <span
                              className="topbar__notification-dot"
                              aria-label="No leída"
                            />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {!autenticado || !usuario ? (
          <button
            className="topbar__login-button"
            type="button"
            onClick={() =>
              navigate("/login")
            }
          >
            <LogIn size={17} />
            Iniciar sesión
          </button>
        ) : (
          <div className="topbar__user">
            <button
              className="topbar__user-button"
              type="button"
              aria-expanded={
                menuUsuarioAbierto
              }
              aria-haspopup="menu"
              onClick={() => {
                setMenuUsuarioAbierto(
                  (estadoActual) =>
                    !estadoActual,
                );

                setPanelNotificacionesAbierto(
                  false,
                );
              }}
            >
              <span className="topbar__avatar">
                {inicialUsuario}
              </span>

              <span className="topbar__user-info">
                <strong>
                  {usuario.nombre}{" "}
                  {usuario.apellido}
                </strong>

                <small>
                  {usuario.rol}
                </small>
              </span>
            </button>

            {menuUsuarioAbierto && (
              <div
                className="topbar__user-menu"
                role="menu"
              >
                <div className="topbar__user-menu-header">
                  <UserRound size={18} />

                  <div>
                    <strong>
                      {usuario.nombre}{" "}
                      {usuario.apellido}
                    </strong>

                    <span>
                      {usuario.email}
                    </span>
                  </div>
                </div>

                {usuario.rol ===
                  "administrador" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuUsuarioAbierto(
                        false,
                      );

                      navigate("/admin");
                    }}
                  >
                    <LayoutDashboard
                      size={17}
                    />
                    Panel administrativo
                  </button>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuUsuarioAbierto(
                      false,
                    );

                    navigate(
                      "/configuracion",
                    );
                  }}
                >
                  <Settings size={17} />
                  Configuración
                </button>

                <button
                  className="topbar__logout-button"
                  type="button"
                  role="menuitem"
                  onClick={cerrarSesion}
                >
                  <LogOut size={17} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Topbar;