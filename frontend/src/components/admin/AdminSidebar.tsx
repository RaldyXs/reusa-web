import {
  BarChart3,
  FolderTree,
  LogOut,
  PackageSearch,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

function AdminSidebar() {
  const navigate = useNavigate();

  const {
    usuario,
    logout,
  } = useAuth();

  function cerrarSesion(): void {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__logo">
          <ShieldCheck size={22} />
        </div>

        <div>
          <strong>Admin Panel</strong>

          <span>Re-Usa Web</span>
        </div>
      </div>

      <div className="admin-sidebar__user">
        <div className="admin-sidebar__avatar">
          {usuario?.nombre
            ?.charAt(0)
            .toUpperCase() ?? "A"}
        </div>

        <div>
          <strong>
            {usuario?.nombre}{" "}
            {usuario?.apellido}
          </strong>

          <span>Administrador</span>
        </div>
      </div>

      <nav
        className="admin-sidebar__navigation"
        aria-label="Navegación administrativa"
      >
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar__link admin-sidebar__link--active"
              : "admin-sidebar__link"
          }
        >
          <BarChart3 size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/usuarios"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar__link admin-sidebar__link--active"
              : "admin-sidebar__link"
          }
        >
          <Users size={18} />
          Usuarios
        </NavLink>

        <NavLink
          to="/admin/publicaciones"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar__link admin-sidebar__link--active"
              : "admin-sidebar__link"
          }
        >
          <PackageSearch size={18} />
          Publicaciones
        </NavLink>

        <NavLink
          to="/admin/categorias"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar__link admin-sidebar__link--active"
              : "admin-sidebar__link"
          }
        >
          <FolderTree size={18} />
          Categorías
        </NavLink>
      </nav>

      <div className="admin-sidebar__bottom">
        <button
          type="button"
          className="admin-sidebar__secondary"
          onClick={() => navigate("/")}
        >
          <Store size={18} />
          Ver Marketplace
        </button>

        <button
          type="button"
          className="admin-sidebar__secondary"
          onClick={() =>
            navigate("/configuracion")
          }
        >
          <Settings size={18} />
          Configuración
        </button>

        <button
          type="button"
          className="admin-sidebar__logout"
          onClick={cerrarSesion}
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;