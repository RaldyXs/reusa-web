import {
  CalendarDays,
  Clock3,
  PackageCheck,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  obtenerOfertasRealizadas,
  type EstadoOferta,
  type Oferta,
} from "../services/ofertaService";

type FiltroEstado =
  | "todos"
  | EstadoOferta;

function formatearPrecio(
  precio: number | string,
): string {
  return Number(precio).toLocaleString(
    "es-DO",
    {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 0,
    },
  );
}

function formatearFecha(
  fecha: string,
): string {
  const fechaOferta = new Date(fecha);

  if (
    Number.isNaN(
      fechaOferta.getTime(),
    )
  ) {
    return "Fecha no disponible";
  }

  return fechaOferta.toLocaleDateString(
    "es-DO",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

function obtenerTextoEstado(
  estado: EstadoOferta,
): string {
  const textos: Record<
    EstadoOferta,
    string
  > = {
    pendiente: "Pendiente",
    aceptada: "Aceptada",
    rechazada: "Rechazada",
    contraoferta: "Contraoferta",
  };

  return textos[estado];
}

function obtenerIconoEstado(
  estado: EstadoOferta,
) {
  if (estado === "aceptada") {
    return <PackageCheck size={13} />;
  }

  if (estado === "rechazada") {
    return <XCircle size={13} />;
  }

  return <Clock3 size={13} />;
}

function PurchaseHistory() {
  const navigate = useNavigate();

  const [
    estadoSeleccionado,
    setEstadoSeleccionado,
  ] = useState<FiltroEstado>(
    "todos",
  );

  const [ofertas, setOfertas] =
    useState<Oferta[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarOfertas() {
      try {
        setCargando(true);
        setError("");

        const datos =
          await obtenerOfertasRealizadas();

        if (componenteActivo) {
          setOfertas(datos);
        }
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar las ofertas realizadas";

        if (componenteActivo) {
          setError(mensaje);
          setOfertas([]);
        }
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
    estadoSeleccionado === "todos"
      ? ofertas
      : ofertas.filter(
          (oferta) =>
            oferta.estado ===
            estadoSeleccionado,
        );

  return (
    <section className="history-page">
      <header className="history-page__header">
        <div>
          <span>Mi cuenta</span>

          <h1>Historial de compras</h1>

          <p>
            Consulta las ofertas que has
            realizado y revisa su estado.
          </p>
        </div>

        <div className="history-page__filters">
          <select
            aria-label="Filtrar ofertas por estado"
            value={estadoSeleccionado}
            onChange={(evento) =>
              setEstadoSeleccionado(
                evento.target
                  .value as FiltroEstado,
              )
            }
          >
            <option value="todos">
              Todos los estados
            </option>

            <option value="pendiente">
              Pendientes
            </option>

            <option value="aceptada">
              Aceptadas
            </option>

            <option value="rechazada">
              Rechazadas
            </option>

            <option value="contraoferta">
              Contraofertas
            </option>
          </select>

          <button type="button">
            <CalendarDays size={16} />
            Todas las fechas
          </button>
        </div>
      </header>

      {error ? (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      ) : cargando ? (
        <p className="status-message">
          Cargando historial de compras...
        </p>
      ) : (
        <section className="history-card">
          <div className="history-table history-table--purchases">
            <div className="history-table__row history-table__row--header">
              <span>Producto</span>
              <span>Oferta</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span>Acción</span>
            </div>

            {ofertasFiltradas.map(
              (oferta) => (
                <article
                  className="history-table__row"
                  key={oferta.oferta_id}
                >
                  <div className="history-product">
                    <span className="history-product__image">
                      {oferta.imagen_principal ? (
                        <img
                          src={
                            oferta.imagen_principal
                          }
                          alt={
                            oferta.articulo_titulo ??
                            "Artículo"
                          }
                        />
                      ) : (
                        <ShoppingBag
                          size={20}
                        />
                      )}
                    </span>

                    <div>
                      <strong>
                        {oferta.articulo_titulo ??
                          "Artículo"}
                      </strong>

                      <span>
                        Vendedor:{" "}
                        {oferta.vendedor_nombre ??
                          "No disponible"}
                      </span>
                    </div>
                  </div>

                  <strong className="history-price">
                    {formatearPrecio(
                      oferta.precio_ofertado,
                    )}
                  </strong>

                  <span>
                    {formatearFecha(
                      oferta.fecha_oferta,
                    )}
                  </span>

                  <span
                    className={`history-status history-status--${oferta.estado}`}
                  >
                    {obtenerIconoEstado(
                      oferta.estado,
                    )}

                    {obtenerTextoEstado(
                      oferta.estado,
                    )}
                  </span>

                  <button
                    className="history-action"
                    type="button"
                    onClick={() =>
                      navigate(
                        `/producto/${oferta.articulo_id}`,
                      )
                    }
                  >
                    Ver producto
                  </button>
                </article>
              ),
            )}
          </div>

          {ofertasFiltradas.length ===
            0 && (
            <p className="status-message">
              No hay ofertas con ese
              estado.
            </p>
          )}

          <footer className="history-card__footer">
            Mostrando{" "}
            {ofertasFiltradas.length} de{" "}
            {ofertas.length} ofertas
          </footer>
        </section>
      )}
    </section>
  );
}

export default PurchaseHistory;