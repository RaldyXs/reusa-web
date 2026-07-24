import {
  Bell,
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
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function Topbar() {
  const navigate = useNavigate();

  const {
    autenticado,
    usuario,
    logout,
  } = useAuth();

  const [terminoBusqueda, setTerminoBusqueda] =
    useState("");

  const [menuUsuarioAbierto, setMenuUsuarioAbierto] =
    useState(false);

  function manejarBusqueda(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const terminoLimpio = terminoBusqueda.trim();

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

  function cerrarSesion() {
    logout();
    setMenuUsuarioAbierto(false);

    navigate("/", {
      replace: true,
    });
  }

  const inicialUsuario =
    usuario?.nombre.trim().charAt(0).toUpperCase() ??
    "U";

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
            setTerminoBusqueda(event.target.value)
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
        >
          <MessageSquare size={19} />
        </button>

        <button
          className="topbar__icon-button"
          type="button"
          aria-label="Guardados"
          title="Guardados"
          onClick={() => navigate("/guardados")}
        >
          <Heart size={19} />
        </button>

        <button
          className="topbar__icon-button"
          type="button"
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <Bell size={19} />
        </button>

        {!autenticado || !usuario ? (
          <button
            className="topbar__login-button"
            type="button"
            onClick={() => navigate("/login")}
          >
            <LogIn size={17} />
            Iniciar sesión
          </button>
        ) : (
          <div className="topbar__user">
            <button
              className="topbar__user-button"
              type="button"
              aria-expanded={menuUsuarioAbierto}
              aria-haspopup="menu"
              onClick={() =>
                setMenuUsuarioAbierto(
                  (estadoActual) => !estadoActual,
                )
              }
            >
              <span className="topbar__avatar">
                {inicialUsuario}
              </span>

              <span className="topbar__user-info">
                <strong>
                  {usuario.nombre} {usuario.apellido}
                </strong>

                <small>{usuario.rol}</small>
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
                      {usuario.nombre} {usuario.apellido}
                    </strong>

                    <span>{usuario.email}</span>
                  </div>
                </div>

                {usuario.rol ===
                  "administrador" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuUsuarioAbierto(false);
                      navigate("/admin");
                    }}
                  >
                    <LayoutDashboard size={17} />
                    Panel administrativo
                  </button>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuUsuarioAbierto(false);
                    navigate("/configuracion");
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