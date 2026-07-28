import {
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  cambiarEstadoUsuarioAdmin,
  obtenerUsuariosAdmin,
  type UsuarioAdministracion,
} from "../../services/adminService";

type FiltroEstado =
  | "todos"
  | "activos"
  | "inactivos";

type FiltroRol =
  | "todos"
  | "usuario"
  | "administrador";

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
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(fechaConvertida);
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function AdminUsers() {
  const [usuarios, setUsuarios] =
    useState<UsuarioAdministracion[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>("todos");

  const [filtroRol, setFiltroRol] =
    useState<FiltroRol>("todos");

  const [cargando, setCargando] =
    useState(true);

  const [actualizando, setActualizando] =
    useState(false);

  const [
    usuarioActualizandoId,
    setUsuarioActualizandoId,
  ] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [mensaje, setMensaje] =
    useState("");

  const cargarUsuarios = useCallback(
    async (
      mostrarActualizacion = false,
    ): Promise<void> => {
      try {
        setError("");
        setMensaje("");

        if (mostrarActualizacion) {
          setActualizando(true);
        } else {
          setCargando(true);
        }

        const usuariosRecibidos =
          await obtenerUsuariosAdmin();

        setUsuarios(usuariosRecibidos);
      } catch (errorDesconocido) {
        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar los usuarios",
        );
      } finally {
        setCargando(false);
        setActualizando(false);
      }
    },
    [],
  );

  useEffect(() => {
    const temporizador = window.setTimeout(
      () => {
        void cargarUsuarios();
      },
      0,
    );

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [cargarUsuarios]);

  async function manejarCambioEstado(
    usuario: UsuarioAdministracion,
  ): Promise<void> {
    const usuarioEstaActivo =
      usuario.activo === 1;

    const nuevoEstado =
      !usuarioEstaActivo;

    const accion =
      nuevoEstado
        ? "activar"
        : "desactivar";

    const confirmado = window.confirm(
      `¿Seguro que deseas ${accion} la cuenta de ${usuario.nombre} ${usuario.apellido}?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setError("");
      setMensaje("");
      setUsuarioActualizandoId(
        usuario.usuario_id,
      );

      const usuarioActualizado =
        await cambiarEstadoUsuarioAdmin(
          usuario.usuario_id,
          nuevoEstado,
        );

      setUsuarios((usuariosActuales) =>
        usuariosActuales.map(
          (usuarioActual) =>
            usuarioActual.usuario_id ===
            usuarioActualizado.usuario_id
              ? usuarioActualizado
              : usuarioActual,
        ),
      );

      setMensaje(
        nuevoEstado
          ? "Usuario activado correctamente."
          : "Usuario desactivado correctamente.",
      );
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar el usuario",
      );
    } finally {
      setUsuarioActualizandoId(null);
    }
  }

  const usuariosFiltrados = useMemo(() => {
    const termino =
      normalizarTexto(busqueda);

    return usuarios.filter((usuario) => {
      const nombreCompleto =
        normalizarTexto(
          `${usuario.nombre} ${usuario.apellido}`,
        );

      const correo =
        normalizarTexto(usuario.email);

      const telefono =
        normalizarTexto(
          usuario.telefono ?? "",
        );

      const ubicacion =
        normalizarTexto(
          usuario.ubicacion ?? "",
        );

      const coincideBusqueda =
        !termino ||
        nombreCompleto.includes(termino) ||
        correo.includes(termino) ||
        telefono.includes(termino) ||
        ubicacion.includes(termino);

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activos" &&
          usuario.activo === 1) ||
        (filtroEstado === "inactivos" &&
          usuario.activo === 0);

      const coincideRol =
        filtroRol === "todos" ||
        usuario.rol === filtroRol;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideRol
      );
    });
  }, [
    busqueda,
    filtroEstado,
    filtroRol,
    usuarios,
  ]);

  const totalActivos = useMemo(
    () =>
      usuarios.filter(
        (usuario) => usuario.activo === 1,
      ).length,
    [usuarios],
  );

  const totalInactivos = useMemo(
    () =>
      usuarios.filter(
        (usuario) => usuario.activo === 0,
      ).length,
    [usuarios],
  );

  const totalAdministradores = useMemo(
    () =>
      usuarios.filter(
        (usuario) =>
          usuario.rol === "administrador",
      ).length,
    [usuarios],
  );

  if (cargando) {
    return (
      <section className="admin-users-page">
        <p className="status-message">
          Cargando usuarios...
        </p>
      </section>
    );
  }

  return (
    <section className="admin-users-page">
      <header className="admin-content-header">
        <div>
          <span>GESTIÓN DE USUARIOS</span>

          <h1>Usuarios registrados</h1>

          <p>
            Consulta las cuentas registradas,
            sus roles y el estado de acceso.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          disabled={actualizando}
          onClick={() =>
            void cargarUsuarios(true)
          }
        >
          <RefreshCw
            size={17}
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
      </header>

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      {mensaje && (
        <div
          className="success-message"
          role="status"
        >
          {mensaje}
        </div>
      )}

      <div className="admin-users-summary">
        <article>
          <div>
            <Users size={21} />
          </div>

          <span>Total de usuarios</span>

          <strong>{usuarios.length}</strong>
        </article>

        <article>
          <div>
            <UserCheck size={21} />
          </div>

          <span>Usuarios activos</span>

          <strong>{totalActivos}</strong>
        </article>

        <article>
          <div>
            <UserRoundX size={21} />
          </div>

          <span>Usuarios inactivos</span>

          <strong>{totalInactivos}</strong>
        </article>

        <article>
          <div>
            <ShieldCheck size={21} />
          </div>

          <span>Administradores</span>

          <strong>
            {totalAdministradores}
          </strong>
        </article>
      </div>

      <section className="admin-management-card">
        <div className="admin-management-toolbar">
          <div className="admin-search-field">
            <Search size={18} />

            <input
              type="search"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(
                  event.target.value,
                )
              }
              placeholder="Buscar por nombre, correo, teléfono o ubicación"
              aria-label="Buscar usuarios"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(
                event.target
                  .value as FiltroEstado,
              )
            }
            aria-label="Filtrar por estado"
          >
            <option value="todos">
              Todos los estados
            </option>

            <option value="activos">
              Activos
            </option>

            <option value="inactivos">
              Inactivos
            </option>
          </select>

          <select
            value={filtroRol}
            onChange={(event) =>
              setFiltroRol(
                event.target
                  .value as FiltroRol,
              )
            }
            aria-label="Filtrar por rol"
          >
            <option value="todos">
              Todos los roles
            </option>

            <option value="usuario">
              Usuarios
            </option>

            <option value="administrador">
              Administradores
            </option>
          </select>
        </div>

        <div className="admin-management-card__header">
          <div>
            <h2>Listado de usuarios</h2>

            <p>
              Mostrando{" "}
              {usuariosFiltrados.length} de{" "}
              {usuarios.length} registros.
            </p>
          </div>
        </div>

        {usuariosFiltrados.length === 0 ? (
          <p className="status-message">
            No se encontraron usuarios con los
            filtros seleccionados.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Contacto</th>
                  <th>Ubicación</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha de registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map(
                  (usuario) => {
                    const procesando =
                      usuarioActualizandoId ===
                      usuario.usuario_id;

                    const estaActivo =
                      usuario.activo === 1;

                    return (
                      <tr
                        key={
                          usuario.usuario_id
                        }
                      >
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">
                              {usuario.nombre
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {usuario.nombre}{" "}
                                {usuario.apellido}
                              </strong>

                              <small>
                                ID:{" "}
                                {
                                  usuario.usuario_id
                                }
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-table-stack">
                            <strong>
                              {usuario.email}
                            </strong>

                            <small>
                              {usuario.telefono ??
                                "Sin teléfono"}
                            </small>
                          </div>
                        </td>

                        <td>
                          {usuario.ubicacion ??
                            "Sin ubicación"}
                        </td>

                        <td>
                          <span
                            className={
                              usuario.rol ===
                              "administrador"
                                ? "admin-role-badge admin-role-badge--admin"
                                : "admin-role-badge"
                            }
                          >
                            {usuario.rol ===
                            "administrador"
                              ? "Administrador"
                              : "Usuario"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              estaActivo
                                ? "admin-status admin-status--activa"
                                : "admin-status admin-status--inactiva"
                            }
                          >
                            {estaActivo
                              ? "Activo"
                              : "Inactivo"}
                          </span>
                        </td>

                        <td>
                          {formatearFecha(
                            usuario.fecha_registro,
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className={
                              estaActivo
                                ? "admin-user-action admin-user-action--deactivate"
                                : "admin-user-action admin-user-action--activate"
                            }
                            disabled={
                              procesando ||
                              usuarioActualizandoId !==
                                null
                            }
                            onClick={() =>
                              void manejarCambioEstado(
                                usuario,
                              )
                            }
                          >
                            {procesando
                              ? "Procesando..."
                              : estaActivo
                                ? "Desactivar"
                                : "Activar"}
                          </button>
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

export default AdminUsers;