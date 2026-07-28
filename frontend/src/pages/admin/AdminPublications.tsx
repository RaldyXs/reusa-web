import {
  Archive,
  FileCheck2,
  FileClock,
  FileText,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  cambiarEstadoPublicacionAdmin,
  obtenerPublicacionesAdmin,
  type EstadoPublicacionAdministracion,
  type PublicacionAdministracion,
} from "../../services/adminService";

type FiltroEstado =
  | "todos"
  | "activas"
  | "vendidas"
  | "archivadas";

type FiltroCondicion =
  | "todas"
  | "nuevo"
  | "usado"
  | "reparado";

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

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat(
    "es-DO",
    {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 0,
    },
  ).format(Number(precio));
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obtenerEstado(
  publicacion: PublicacionAdministracion,
): "activa" | "vendida" | "archivada" {
  if (
    publicacion.archivado === 1 ||
    publicacion.estado === "archivado"
  ) {
    return "archivada";
  }

  if (publicacion.estado === "vendido") {
    return "vendida";
  }

  return "activa";
}

function formatearCondicion(
  condicion: PublicacionAdministracion["condicion"],
): string {
  if (condicion === "nuevo") {
    return "Nuevo";
  }

  if (condicion === "reparado") {
    return "Reparado";
  }

  return "Usado";
}

function obtenerMensajeConfirmacion(
  publicacion: PublicacionAdministracion,
  nuevoEstado: EstadoPublicacionAdministracion,
): string {
  if (nuevoEstado === "activo") {
    return `¿Seguro que deseas activar la publicación "${publicacion.titulo}"?`;
  }

  if (nuevoEstado === "vendido") {
    return `¿Seguro que deseas marcar como vendida la publicación "${publicacion.titulo}"?`;
  }

  return `¿Seguro que deseas archivar la publicación "${publicacion.titulo}"?`;
}

function obtenerMensajeExito(
  nuevoEstado: EstadoPublicacionAdministracion,
): string {
  if (nuevoEstado === "activo") {
    return "Publicación activada correctamente.";
  }

  if (nuevoEstado === "vendido") {
    return "Publicación marcada como vendida.";
  }

  return "Publicación archivada correctamente.";
}

function AdminPublications() {
  const [publicaciones, setPublicaciones] =
    useState<PublicacionAdministracion[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>("todos");

  const [
    filtroCondicion,
    setFiltroCondicion,
  ] = useState<FiltroCondicion>("todas");

  const [cargando, setCargando] =
    useState(true);

  const [actualizando, setActualizando] =
    useState(false);

  const [
    publicacionActualizandoId,
    setPublicacionActualizandoId,
  ] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] =
    useState("");

  const cargarPublicaciones =
    useCallback(
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

          const publicacionesRecibidas =
            await obtenerPublicacionesAdmin();

          setPublicaciones(
            publicacionesRecibidas,
          );
        } catch (errorDesconocido) {
          setError(
            errorDesconocido instanceof Error
              ? errorDesconocido.message
              : "No se pudieron cargar las publicaciones",
          );
        } finally {
          setCargando(false);
          setActualizando(false);
        }
      },
      [],
    );

  useEffect(() => {
    const temporizador =
      window.setTimeout(() => {
        void cargarPublicaciones();
      }, 0);

    return () => {
      window.clearTimeout(
        temporizador,
      );
    };
  }, [cargarPublicaciones]);

  async function manejarCambioEstado(
    publicacion: PublicacionAdministracion,
    nuevoEstado: EstadoPublicacionAdministracion,
  ): Promise<void> {
    const confirmado = window.confirm(
      obtenerMensajeConfirmacion(
        publicacion,
        nuevoEstado,
      ),
    );

    if (!confirmado) {
      return;
    }

    try {
      setError("");
      setMensaje("");
      setPublicacionActualizandoId(
        publicacion.articulo_id,
      );

      const publicacionActualizada =
        await cambiarEstadoPublicacionAdmin(
          publicacion.articulo_id,
          nuevoEstado,
        );

      setPublicaciones(
        (publicacionesActuales) =>
          publicacionesActuales.map(
            (publicacionActual) =>
              publicacionActual.articulo_id ===
              publicacionActualizada.articulo_id
                ? publicacionActualizada
                : publicacionActual,
          ),
      );

      setMensaje(
        obtenerMensajeExito(nuevoEstado),
      );
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar la publicación",
      );
    } finally {
      setPublicacionActualizandoId(null);
    }
  }

  const publicacionesFiltradas =
    useMemo(() => {
      const termino =
        normalizarTexto(busqueda);

      return publicaciones.filter(
        (publicacion) => {
          const estado =
            obtenerEstado(publicacion);

          const coincideBusqueda =
            !termino ||
            normalizarTexto(
              publicacion.titulo,
            ).includes(termino) ||
            normalizarTexto(
              publicacion.vendedor_nombre,
            ).includes(termino) ||
            normalizarTexto(
              publicacion.vendedor_email,
            ).includes(termino) ||
            normalizarTexto(
              publicacion.categoria,
            ).includes(termino);

          const coincideEstado =
            filtroEstado === "todos" ||
            (filtroEstado === "activas" &&
              estado === "activa") ||
            (filtroEstado === "vendidas" &&
              estado === "vendida") ||
            (filtroEstado === "archivadas" &&
              estado === "archivada");

          const coincideCondicion =
            filtroCondicion === "todas" ||
            publicacion.condicion ===
              filtroCondicion;

          return (
            coincideBusqueda &&
            coincideEstado &&
            coincideCondicion
          );
        },
      );
    }, [
      busqueda,
      filtroCondicion,
      filtroEstado,
      publicaciones,
    ]);

  const totalActivas = useMemo(
    () =>
      publicaciones.filter(
        (publicacion) =>
          obtenerEstado(publicacion) ===
          "activa",
      ).length,
    [publicaciones],
  );

  const totalVendidas = useMemo(
    () =>
      publicaciones.filter(
        (publicacion) =>
          obtenerEstado(publicacion) ===
          "vendida",
      ).length,
    [publicaciones],
  );

  const totalArchivadas = useMemo(
    () =>
      publicaciones.filter(
        (publicacion) =>
          obtenerEstado(publicacion) ===
          "archivada",
      ).length,
    [publicaciones],
  );

  if (cargando) {
    return (
      <section className="admin-publications-page">
        <p className="status-message">
          Cargando publicaciones...
        </p>
      </section>
    );
  }

  return (
    <section className="admin-publications-page">
      <header className="admin-content-header">
        <div>
          <span>
            GESTIÓN DE PUBLICACIONES
          </span>

          <h1>
            Publicaciones del marketplace
          </h1>

          <p>
            Consulta los artículos publicados,
            sus vendedores y su estado actual.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          disabled={actualizando}
          onClick={() =>
            void cargarPublicaciones(true)
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
            <FileText size={21} />
          </div>

          <span>Total</span>

          <strong>
            {publicaciones.length}
          </strong>
        </article>

        <article>
          <div>
            <FileCheck2 size={21} />
          </div>

          <span>Activas</span>

          <strong>{totalActivas}</strong>
        </article>

        <article>
          <div>
            <ShoppingBag size={21} />
          </div>

          <span>Vendidas</span>

          <strong>{totalVendidas}</strong>
        </article>

        <article>
          <div>
            <Archive size={21} />
          </div>

          <span>Archivadas</span>

          <strong>
            {totalArchivadas}
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
              placeholder="Buscar por publicación, vendedor, correo o categoría"
              aria-label="Buscar publicaciones"
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

            <option value="activas">
              Activas
            </option>

            <option value="vendidas">
              Vendidas
            </option>

            <option value="archivadas">
              Archivadas
            </option>
          </select>

          <select
            value={filtroCondicion}
            onChange={(event) =>
              setFiltroCondicion(
                event.target
                  .value as FiltroCondicion,
              )
            }
            aria-label="Filtrar por condición"
          >
            <option value="todas">
              Todas las condiciones
            </option>

            <option value="nuevo">
              Nuevo
            </option>

            <option value="usado">
              Usado
            </option>

            <option value="reparado">
              Reparado
            </option>
          </select>
        </div>

        <div className="admin-management-card__header">
          <div>
            <h2>
              Listado de publicaciones
            </h2>

            <p>
              Mostrando{" "}
              {
                publicacionesFiltradas.length
              }{" "}
              de {publicaciones.length} registros.
            </p>
          </div>
        </div>

        {publicacionesFiltradas.length ===
        0 ? (
          <p className="status-message">
            No se encontraron publicaciones con
            los filtros seleccionados.
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
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {publicacionesFiltradas.map(
                  (publicacion) => {
                    const estado =
                      obtenerEstado(
                        publicacion,
                      );

                    const procesando =
                      publicacionActualizandoId ===
                      publicacion.articulo_id;

                    const hayOtraActualizacion =
                      publicacionActualizandoId !==
                      null;

                    return (
                      <tr
                        key={
                          publicacion.articulo_id
                        }
                      >
                        <td>
                          <div className="admin-table-stack">
                            <strong>
                              {
                                publicacion.titulo
                              }
                            </strong>

                            <small>
                              ID:{" "}
                              {
                                publicacion.articulo_id
                              }
                            </small>
                          </div>
                        </td>

                        <td>
                          <div className="admin-table-stack">
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
                          </div>
                        </td>

                        <td>
                          {
                            publicacion.categoria
                          }
                        </td>

                        <td>
                          {formatearPrecio(
                            publicacion.precio,
                          )}
                        </td>

                        <td>
                          {formatearCondicion(
                            publicacion.condicion,
                          )}
                        </td>

                        <td>
                          <span
                            className={`admin-status admin-status--${estado}`}
                          >
                            {estado === "activa"
                              ? "Activa"
                              : estado ===
                                  "vendida"
                                ? "Vendida"
                                : "Archivada"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-table-date">
                            <FileClock
                              size={15}
                            />

                            {formatearFecha(
                              publicacion.fecha_publicacion,
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="admin-publication-actions">
                            {estado !== "activa" && (
                              <button
                                type="button"
                                className="admin-publication-action admin-publication-action--activate"
                                disabled={
                                  hayOtraActualizacion
                                }
                                onClick={() =>
                                  void manejarCambioEstado(
                                    publicacion,
                                    "activo",
                                  )
                                }
                              >
                                <RotateCcw
                                  size={15}
                                />

                                {procesando
                                  ? "Procesando..."
                                  : "Activar"}
                              </button>
                            )}

                            {estado !== "vendida" && (
                              <button
                                type="button"
                                className="admin-publication-action admin-publication-action--sold"
                                disabled={
                                  hayOtraActualizacion
                                }
                                onClick={() =>
                                  void manejarCambioEstado(
                                    publicacion,
                                    "vendido",
                                  )
                                }
                              >
                                <ShoppingBag
                                  size={15}
                                />

                                {procesando
                                  ? "Procesando..."
                                  : "Vendida"}
                              </button>
                            )}

                            {estado !== "archivada" && (
                              <button
                                type="button"
                                className="admin-publication-action admin-publication-action--archive"
                                disabled={
                                  hayOtraActualizacion
                                }
                                onClick={() =>
                                  void manejarCambioEstado(
                                    publicacion,
                                    "archivado",
                                  )
                                }
                              >
                                <Archive
                                  size={15}
                                />

                                {procesando
                                  ? "Procesando..."
                                  : "Archivar"}
                              </button>
                            )}
                          </div>
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

export default AdminPublications;