import {
  FileText,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function AdminDashboard() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  function cerrarSesion() {
    logout();
    navigate("/login", {
      replace: true,
    });
  }

  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span>PANEL DE ADMINISTRACIÓN</span>

          <h1>
            Bienvenido, {usuario?.nombre}
          </h1>

          <p>
            Administra usuarios, publicaciones
            y categorías.
          </p>
        </div>

        <button
          type="button"
          onClick={cerrarSesion}
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </header>

      <div className="admin-summary">
        <article>
          <Users size={25} />
          <span>Usuarios</span>
          <strong>Próximamente</strong>
        </article>

        <article>
          <FileText size={25} />
          <span>Publicaciones</span>
          <strong>Próximamente</strong>
        </article>

        <article>
          <ShieldCheck size={25} />
          <span>Moderación</span>
          <strong>Próximamente</strong>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboard;