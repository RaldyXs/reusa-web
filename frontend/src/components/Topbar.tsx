import {
  Bell,
  Heart,
  MessageSquare,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  return (
    <header className="topbar topbar--without-brand">
      <form
        className="topbar__search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search size={18} />

        <input
          type="search"
          placeholder="Buscar en Re-Usa..."
          aria-label="Buscar artículos"
        />
      </form>

      <nav
        className="topbar__navigation"
        aria-label="Navegación superior"
      >
        <Link to="/categorias" className="topbar__link">
          Categorías
        </Link>

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
          aria-label="Configuración del usuario"
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