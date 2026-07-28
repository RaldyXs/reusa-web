import {
  FileText,
  FolderOpen,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import {
  obtenerPublicacionesAdmin,
  obtenerResumenAdmin,
  obtenerUsuariosAdmin,
  type PublicacionAdministracion,
  type ResumenAdministracion,
  type UsuarioAdministracion,
} from "../services/adminService";

function formatearFecha(fecha: string): string {
  const fechaConvertida = new Date(fecha);

  if (
    Number.isNaN(fechaConvertida.getTime())
  ) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-DO",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(fechaConvertida);
}

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat(
    "es-DO",
    {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 2,
    },
  ).format(Number(precio));
}

function obtenerEstadoPublicacion(
  publicacion: PublicacionAdministracion,
): string {
  if (
    publicacion.archivado === 1 ||
    publicacion.estado === "archivado"
  ) {
    return "Archivada";
  }

  if (publicacion.estado === "vendido") {
    return "Vendida";
  }

  return "Activa";
}

function AdminDashboard() {
  const navigate = useNavigate();

  const {
    usuario,
    logout,
  } = useAuth();

  const [resumen, setResumen] =
    useState<ResumenAdministracion | null>(
      null,
    );

  const [usuarios, setUsuarios] =
    useState<UsuarioAdministracion[]>([]);

  const [publicaciones, setPublicaciones] =
    useState<
      PublicacionAdministracion[]
    >([]);

  const [cargando, setCargando] =
    useState(true);

  const [actualizando, setActualizando] =
    useState(false);

  const [error, setError] = useState("");

  const cargarDatos =
    useCallback(
      async (
        mostrarActualizacion = false,
      ): Promise<void> => {
        try {
          setError("");

          if (mostrarActualizacion) {
            setActualizando(true);
          } else {
            setCargando(true);
          }

          const [
            resumenRecibido,
            usuariosRecibidos,
            publicacionesRecibidas,
          ] = await Promise.all([
            obtenerResumenAdmin(),
            obtenerUsuariosAdmin(),
            obtenerPublicacionesAdmin(),
          ]);

          setResumen(resumenRecibido);
          setUsuarios(usuariosRecibidos);
          setPublicaciones(
            publicacionesRecibidas,
          );
        } catch (errorDesconocido) {
          setError(
            errorDesconocido instanceof Error
              ? errorDesconocido.message
              : "No se pudieron cargar los datos administrativos",
          );
        } finally {
          setCargando(false);
          setActualizando(false);
        }
      },
      [],
    );

  useEffect(() => {
  const temporizador = window.setTimeout(() => {
    void cargarDatos();
  }, 0);

  return () => {
    window.clearTimeout(temporizador);
  };
}, [cargarDatos]);

  function cerrarSesion(): void {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  if (cargando) {
    return (
      <section className="admin-page">
        <p className="status-message">
          Cargando panel de administración...
        </p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span>
            PANEL DE ADMINISTRACIÓN
          </span>

          <h1>
            Bienvenido, {usuario?.nombre}
          </h1>

          <p>
            Consulta usuarios, publicaciones y
            estadísticas generales del sistema.
          </p>
        </div>

        <div className="admin-header__actions">
          <button
            type="button"
            disabled={actualizando}
            onClick={() =>
              void cargarDatos(true)
            }
          >
            <RefreshCw
              size={18}
              className={
                actualizando
                  ? "admin-spin"
                  : undefined
              }
            />

            {actualizando
              ? "Actualizando..."
              : "Actualizar"}
          </button>

          <button
            type="button"
            onClick={cerrarSesion}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
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

      {resumen && (
        <div className="admin-summary">
          <article>
            <Users size={25} />

            <span>Total de usuarios</span>

            <strong>
              {resumen.total_usuarios}
            </strong>

            <small>
              {resumen.usuarios_activos} activos
            </small>
          </article>

          <article>
            <UserCheck size={25} />

            <span>Usuarios activos</span>

            <strong>
              {resumen.usuarios_activos}
            </strong>

            <small>
              Cuentas habilitadas
            </small>
          </article>

          <article>
            <FileText size={25} />

            <span>Publicaciones</span>

            <strong>
              {resumen.total_publicaciones}
            </strong>

            <small>
              {resumen.publicaciones_activas} activas
            </small>
          </article>

          <article>
            <ShieldCheck size={25} />

            <span>Vendidas</span>

            <strong>
              {resumen.publicaciones_vendidas}
            </strong>

            <small>
              Artículos completados
            </small>
          </article>

          <article>
            <FolderOpen size={25} />

            <span>Archivadas</span>

            <strong>
              {
                resumen
                  .publicaciones_archivadas
              }
            </strong>

            <small>
              No visibles al público
            </small>
          </article>

          <article>
            <FolderOpen size={25} />

            <span>Categorías</span>

            <strong>
              {resumen.total_categorias}
            </strong>

            <small>
              Categorías activas
            </small>
          </article>
        </div>
      )}

      <section className="admin-section">
        <div className="admin-section__header">
          <div>
            <span>USUARIOS</span>

            <h2>
              Usuarios registrados
            </h2>

            <p>
              Cuentas registradas actualmente en
              Re-Usa Web.
            </p>
          </div>

          <strong>
            {usuarios.length} registros
          </strong>
        </div>

        {usuarios.length === 0 ? (
          <p className="status-message">
            No hay usuarios registrados.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Ubicación</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registro</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map(
                  (usuarioListado) => (
                    <tr
                      key={
                        usuarioListado.usuario_id
                      }
                    >
                      <td>
                        <strong>
                          {
                            usuarioListado.nombre
                          }{" "}
                          {
                            usuarioListado.apellido
                          }
                        </strong>

                        <small>
                          {usuarioListado.telefono ??
                            "Sin teléfono"}
                        </small>
                      </td>

                      <td>
                        {usuarioListado.email}
                      </td>

                      <td>
                        {usuarioListado.ubicacion ??
                          "Sin ubicación"}
                      </td>

                      <td>
                        <span className="admin-badge">
                          {usuarioListado.rol ===
                          "administrador"
                            ? "Administrador"
                            : "Usuario"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            usuarioListado.activo ===
                            1
                              ? "admin-status admin-status--active"
                              : "admin-status admin-status--inactive"
                          }
                        >
                          {usuarioListado.activo ===
                          1
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>

                      <td>
                        {formatearFecha(
                          usuarioListado.fecha_registro,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section__header">
          <div>
            <span>PUBLICACIONES</span>

            <h2>
              Publicaciones registradas
            </h2>

            <p>
              Artículos publicados por todos los
              usuarios del marketplace.
            </p>
          </div>

          <strong>
            {publicaciones.length} registros
          </strong>
        </div>

        {publicaciones.length === 0 ? (
          <p className="status-message">
            No hay publicaciones registradas.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Publicación</th>
                  <th>Vendedor</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Condición</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {publicaciones.map(
                  (publicacion) => {
                    const estado =
                      obtenerEstadoPublicacion(
                        publicacion,
                      );

                    return (
                      <tr
                        key={
                          publicacion.articulo_id
                        }
                      >
                        <td>
                          <strong>
                            {publicacion.titulo}
                          </strong>

                          <small>
                            ID:{" "}
                            {
                              publicacion.articulo_id
                            }
                          </small>
                        </td>

                        <td>
                          <strong>
                            {
                              publicacion.vendedor_nombre
                            }
                          </strong>

                          <small>
                            {
                              publicacion.vendedor_email
                            }
                          </small>
                        </td>

                        <td>
                          {publicacion.categoria}
                        </td>

                        <td>
                          {formatearPrecio(
                            publicacion.precio,
                          )}
                        </td>

                        <td>
                          {publicacion.condicion}
                        </td>

                        <td>
                          <span
                            className={`admin-status admin-status--${estado.toLowerCase()}`}
                          >
                            {estado}
                          </span>
                        </td>

                        <td>
                          {formatearFecha(
                            publicacion.fecha_publicacion,
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminDashboard;