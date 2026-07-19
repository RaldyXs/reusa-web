import {
  Bell,
  Heart,
  MessageSquare,
  Search,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] =
    useState("");

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

        <button
          className="topbar__avatar"
          type="button"
          aria-label="Abrir configuración"
          title="Configuración"
          onClick={() => navigate("/configuracion")}
        >
          U
        </button>
      </nav>
    </header>
  );
}

export default Topbar;