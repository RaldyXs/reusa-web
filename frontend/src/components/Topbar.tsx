import {
  Bell,
  Heart,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <Link to="/" className="topbar__brand">
        <div className="topbar__logo">R</div>

        <div className="topbar__brand-text">
          <strong>Re-Usa</strong>
          <span>Marketplace académico</span>
        </div>
      </Link>

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
          className="topbar__publish"
          type="button"
          onClick={() => navigate("/publicar")}
        >
          <Plus size={17} />
          <span>Publicar</span>
        </button>

        <button
          className="topbar__icon-button"
          type="button"
          aria-label="Mensajes"
        >
          <MessageSquare size={19} />
        </button>

        <button
          className="topbar__icon-button"
          type="button"
          aria-label="Guardados"
          onClick={() => navigate("/guardados")}
        >
          <Heart size={19} />
        </button>

        <button
          className="topbar__icon-button"
          type="button"
          aria-label="Notificaciones"
        >
          <Bell size={19} />
        </button>

        <button
          className="topbar__avatar"
          type="button"
          aria-label="Configuración"
          onClick={() => navigate("/configuracion")}
        >
          U
        </button>
      </nav>
    </header>
  );
}

export default Topbar;