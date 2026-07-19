import {
  Bookmark,
  Clock3,
  Grid2X2,
  Home,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const opcionesPrincipales = [
  {
    nombre: "Inicio",
    icono: Home,
    ruta: "/",
  },
  {
    nombre: "Marketplace",
    icono: ShoppingBag,
    ruta: "/marketplace",
  },
  {
    nombre: "Categorías",
    icono: Grid2X2,
    ruta: "/categorias",
  },
  {
    nombre: "Guardados",
    icono: Bookmark,
    ruta: "/guardados",
  },
];

const opcionesCuenta = [
  {
    nombre: "Mis publicaciones",
    icono: Package,
    ruta: "/mis-publicaciones",
  },
  {
    nombre: "Historial de compras",
    icono: Clock3,
    ruta: "/historial-compras",
  },
  {
    nombre: "Historial de ventas",
    icono: Tag,
    ruta: "/historial-ventas",
  },
  {
    nombre: "Configuración",
    icono: Settings,
    ruta: "/configuracion",
  },
];

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar__account">
        <div className="sidebar__account-icon">
          <ShoppingBag size={20} />
        </div>

        <div className="sidebar__account-text">
          <strong>Re-Usa Web</strong>
          <span>Marketplace académico</span>
        </div>
      </div>

      <nav
        className="sidebar__navigation"
        aria-label="Navegación principal"
      >
        {opcionesPrincipales.map((opcion) => {
          const Icono = opcion.icono;

          return (
            <NavLink
              key={opcion.ruta}
              to={opcion.ruta}
              end={opcion.ruta === "/"}
              className={({ isActive }) =>
                isActive
                  ? "sidebar__item sidebar__item--active"
                  : "sidebar__item"
              }
            >
              <Icono size={18} />
              <span>{opcion.nombre}</span>
            </NavLink>
          );
        })}
      </nav>

      <p className="sidebar__section-title">Mi cuenta</p>

      <nav
        className="sidebar__navigation"
        aria-label="Opciones de cuenta"
      >
        {opcionesCuenta.map((opcion) => {
          const Icono = opcion.icono;

          return (
            <NavLink
              key={opcion.ruta}
              to={opcion.ruta}
              className={({ isActive }) =>
                isActive
                  ? "sidebar__item sidebar__item--active"
                  : "sidebar__item"
              }
            >
              <Icono size={18} />
              <span>{opcion.nombre}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        className="sidebar__create-button"
        type="button"
        onClick={() => navigate("/publicar")}
      >
        <Plus size={18} />
        <span>Crear publicación</span>
      </button>
    </aside>
  );
}

export default Sidebar;