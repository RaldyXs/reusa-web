import {
  BadgeDollarSign,
  Filter,
  HandCoins,
  Search,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  obtenerOfertasAdmin,
  type OfertaAdministracion,
} from "../../services/adminService";

type FiltroEstado =
  | "todas"
  | "pendiente"
  | "aceptada"
  | "rechazada"
  | "contraoferta"
  | "cancelada";

function formatearPrecio(
  valor: number | string | null,
): string {
  const precio = Number(valor ?? 0);

  return precio.toLocaleString(
    "es-DO",
    {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 0,
    },
  );
}

function formatearFecha(
  fecha: string | null,
): string {
  if (!fecha) {
    return "Sin respuesta";
  }

  const fechaConvertida =
    new Date(fecha);

  if (
    Number.isNaN(
      fechaConvertida.getTime(),
    )
  ) {
    return fecha;
  }

  return fechaConvertida.toLocaleString(
    "es-DO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function normalizarEstado(
  estado: string,
): string {
  return estado
    .trim()
    .toLowerCase();
}

function obtenerTextoEstado(
  estado: string,
): string {
  const estadoNormalizado =
    normalizarEstado(estado);

  const nombres:
    Record<string, string> = {
      pendiente: "Pendiente",
      aceptada: "Aceptada",
      rechazada: "Rechazada",
      contraoferta: "Contraoferta",
      cancelada: "Cancelada",
    };

  return (
    nombres[estadoNormalizado] ??
    estado
  );
}

function AdminOffers() {
  const [
    ofertas,
    setOfertas,
  ] = useState<
    OfertaAdministracion[]
  >([]);

  const [
    filtroEstado,
    setFiltroEstado,
  ] = useState<FiltroEstado>(
    "todas",
  );

  const [
    terminoBusqueda,
    setTerminoBusqueda,
  ] = useState("");

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarOfertas(): Promise<void> {
      try {
        setCargando(true);
        setError("");

        const datos =
          await obtenerOfertasAdmin();

        if (!componenteActivo) {
          return;
        }

        setOfertas(datos);
      } catch (
        errorDesconocido
      ) {
        if (!componenteActivo) {
          return;
        }

        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar las ofertas";

        setError(mensaje);
        setOfertas([]);
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    void cargarOfertas();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const ofertasFiltradas =
    useMemo(() => {
      const termino =
        terminoBusqueda
          .trim()
          .toLowerCase();

      return ofertas.filter(
        (oferta) => {
          const coincideEstado =
            filtroEstado ===
              "todas" ||
            normalizarEstado(
              oferta.estado,
            ) === filtroEstado;

          const coincideBusqueda =
            !termino ||
            oferta.articulo_titulo
              .toLowerCase()
              .includes(termino) ||
            oferta.comprador_nombre
              .toLowerCase()
              .includes(termino) ||
            oferta.comprador_email
              .toLowerCase()
              .includes(termino) ||
            oferta.vendedor_nombre
              .toLowerCase()
              .includes(termino) ||
            oferta.vendedor_email
              .toLowerCase()
              .includes(termino) ||
            String(
              oferta.oferta_id,
            ).includes(termino);

          return (
            coincideEstado &&
            coincideBusqueda
          );
        },
      );
    }, [
      ofertas,
      filtroEstado,
      terminoBusqueda,
    ]);

  const resumen =
    useMemo(() => {
      return {
        total: ofertas.length,

        pendientes:
          ofertas.filter(
            (oferta) =>
              normalizarEstado(
                oferta.estado,
              ) === "pendiente",
          ).length,

        aceptadas:
          ofertas.filter(
            (oferta) =>
              normalizarEstado(
                oferta.estado,
              ) === "aceptada",
          ).length,

        contraofertas:
          ofertas.filter(
            (oferta) =>
              normalizarEstado(
                oferta.estado,
              ) ===
              "contraoferta",
          ).length,
      };
    }, [ofertas]);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <span>
            Administración
          </span>

          <h1>
            Ofertas
          </h1>

          <p>
            Consulta las negociaciones
            realizadas entre compradores
            y vendedores.
          </p>
        </div>

        <BadgeDollarSign
          size={32}
        />
      </header>

      <div className="admin-summary-grid">
        <article className="admin-summary-card">
          <HandCoins size={22} />

          <div>
            <span>
              Total de ofertas
            </span>

            <strong>
              {resumen.total}
            </strong>
          </div>
        </article>

        <article className="admin-summary-card">
          <HandCoins size={22} />

          <div>
            <span>
              Pendientes
            </span>

            <strong>
              {resumen.pendientes}
            </strong>
          </div>
        </article>

        <article className="admin-summary-card">
          <HandCoins size={22} />

          <div>
            <span>
              Aceptadas
            </span>

            <strong>
              {resumen.aceptadas}
            </strong>
          </div>
        </article>

        <article className="admin-summary-card">
          <HandCoins size={22} />

          <div>
            <span>
              Contraofertas
            </span>

            <strong>
              {resumen.contraofertas}
            </strong>
          </div>
        </article>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Buscar por artículo, comprador, vendedor o ID"
            value={
              terminoBusqueda
            }
            onChange={(evento) =>
              setTerminoBusqueda(
                evento.target.value,
              )
            }
          />
        </label>

        <label className="admin-filter">
          <Filter size={18} />

          <select
            value={filtroEstado}
            onChange={(evento) =>
              setFiltroEstado(
                evento.target
                  .value as FiltroEstado,
              )
            }
          >
            <option value="todas">
              Todos los estados
            </option>

            <option value="pendiente">
              Pendientes
            </option>

            <option value="contraoferta">
              Contraofertas
            </option>

            <option value="aceptada">
              Aceptadas
            </option>

            <option value="rechazada">
              Rechazadas
            </option>

            <option value="cancelada">
              Canceladas
            </option>
          </select>
        </label>
      </div>

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      {cargando ? (
        <p className="status-message">
          Cargando ofertas...
        </p>
      ) : ofertasFiltradas.length ===
        0 ? (
        <div className="admin-empty-state">
          <HandCoins size={34} />

          <strong>
            No hay ofertas
          </strong>

          <span>
            No se encontraron resultados
            con los filtros seleccionados.
          </span>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Artículo</th>
                <th>Comprador</th>
                <th>Vendedor</th>
                <th>Precio publicado</th>
                <th>Oferta</th>
                <th>Contraoferta</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {ofertasFiltradas.map(
                (oferta) => (
                  <tr
                    key={
                      oferta.oferta_id
                    }
                  >
                    <td>
                      #
                      {
                        oferta.oferta_id
                      }
                    </td>

                    <td>
                      <div className="admin-table__primary">
                        <strong>
                          {
                            oferta.articulo_titulo
                          }
                        </strong>

                        <span>
                          Artículo #
                          {
                            oferta.articulo_id
                          }
                        </span>

                        {Number(
                          oferta.articulo_eliminado,
                        ) === 1 && (
                          <small>
                            Eliminado
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="admin-table__primary">
                        <strong>
                          {
                            oferta.comprador_nombre
                          }
                        </strong>

                        <span>
                          {
                            oferta.comprador_email
                          }
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-table__primary">
                        <strong>
                          {
                            oferta.vendedor_nombre
                          }
                        </strong>

                        <span>
                          {
                            oferta.vendedor_email
                          }
                        </span>
                      </div>
                    </td>

                    <td>
                      {formatearPrecio(
                        oferta.precio_publicacion,
                      )}
                    </td>

                    <td>
                      <div className="admin-table__primary">
                        <strong>
                          {formatearPrecio(
                            oferta.precio_oferta,
                          )}
                        </strong>

                        {oferta.mensaje && (
                          <span>
                            {
                              oferta.mensaje
                            }
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      {oferta.precio_contraoferta !==
                      null ? (
                        <div className="admin-table__primary">
                          <strong>
                            {formatearPrecio(
                              oferta.precio_contraoferta,
                            )}
                          </strong>

                          {oferta.mensaje_contraoferta && (
                            <span>
                              {
                                oferta.mensaje_contraoferta
                              }
                            </span>
                          )}
                        </div>
                      ) : (
                        <span>
                          —
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`admin-status admin-status--${normalizarEstado(
                          oferta.estado,
                        )}`}
                      >
                        {obtenerTextoEstado(
                          oferta.estado,
                        )}
                      </span>
                    </td>

                    <td>
                      <div className="admin-table__primary">
                        <span>
                          {formatearFecha(
                            oferta.fecha_oferta,
                          )}
                        </span>

                        {oferta.fecha_respuesta && (
                          <small>
                            Respondida:{" "}
                            {formatearFecha(
                              oferta.fecha_respuesta,
                            )}
                          </small>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminOffers;