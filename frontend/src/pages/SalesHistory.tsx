import {
  CalendarDays,
  CircleDollarSign,
  MessageSquareText,
  Package,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  obtenerOfertasRecibidas,
  responderOferta,
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

function SalesHistory() {
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

  const [
    ofertaProcesandoId,
    setOfertaProcesandoId,
  ] = useState<number | null>(null);

  const cargarOfertas =
    useCallback(async (): Promise<void> => {
      try {
        setCargando(true);
        setError("");

        const datos =
          await obtenerOfertasRecibidas();

        setOfertas(datos);
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar las ofertas recibidas";

        setError(mensaje);
        setOfertas([]);
      } finally {
        setCargando(false);
      }
    }, []);

  useEffect(() => {
    // Defer callivamosng the async loader to avoid setting state synchronously within the effect
    void Promise.resolve().then(() => cargarOfertas());
  }, [cargarOfertas]);

  async function manejarRespuestaOferta(
    ofertaId: number,
    estado:
      | "aceptada"
      | "rechazada",
  ): Promise<void> {
    const mensajeConfirmacion =
      estado === "aceptada"
        ? "¿Deseas aceptar esta oferta? El artículo será marcado como vendido."
        : "¿Deseas rechazar esta oferta?";

    const confirmado =
      window.confirm(
        mensajeConfirmacion,
      );

    if (!confirmado) {
      return;
    }

    try {
      setOfertaProcesandoId(
        ofertaId,
      );

      setError("");

      await responderOferta(
        ofertaId,
        estado,
      );

      const ofertaRespondida =
        ofertas.find(
          (oferta) =>
            oferta.oferta_id ===
            ofertaId,
        );

      setOfertas(
        (ofertasActuales) =>
          ofertasActuales.map(
            (oferta) => {
              if (
                oferta.oferta_id ===
                ofertaId
              ) {
                return {
                  ...oferta,
                  estado,
                };
              }

              if (
                estado === "aceptada" &&
                ofertaRespondida &&
                oferta.articulo_id ===
                  ofertaRespondida.articulo_id &&
                oferta.estado ===
                  "pendiente"
              ) {
                return {
                  ...oferta,
                  estado:
                    "rechazada",
                };
              }

              return oferta;
            },
          ),
      );
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo responder la oferta";

      setError(mensaje);

      await cargarOfertas();
    } finally {
      setOfertaProcesandoId(
        null,
      );
    }
  }

  const ofertasFiltradas =
    estadoSeleccionado === "todos"
      ? ofertas
      : ofertas.filter(
          (oferta) =>
            oferta.estado ===
            estadoSeleccionado,
        );

  const ofertasAceptadas =
    ofertas.filter(
      (oferta) =>
        oferta.estado === "aceptada",
    );

  const totalVendido =
    ofertasAceptadas.reduce(
      (total, oferta) =>
        total +
        Number(
          oferta.precio_ofertado,
        ),
      0,
    );

  const ofertasPendientes =
    ofertas.filter(
      (oferta) =>
        oferta.estado === "pendiente",
    ).length;

  return (
    <section className="history-page">
      <header className="history-page__header">
        <div>
          <span>Mi cuenta</span>

          <h1>
            Historial de ventas
          </h1>

          <p>
            Revisa las ofertas recibidas,
            sus mensajes y responde cada
            propuesta.
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

      <div className="sales-summary">
        <article>
          <CircleDollarSign
            size={21}
          />

          <div>
            <strong>
              {formatearPrecio(
                totalVendido,
              )}
            </strong>

            <span>
              Total vendido
            </span>
          </div>
        </article>

        <article>
          <Package size={21} />

          <div>
            <strong>
              {ofertas.length}
            </strong>

            <span>
              Ofertas recibidas
            </span>
          </div>
        </article>

        <article>
          <UserRound size={21} />

          <div>
            <strong>
              {ofertasPendientes}
            </strong>

            <span>Pendientes</span>
          </div>
        </article>
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
          Cargando historial de ventas...
        </p>
      ) : (
        <section className="history-card">
          <div className="history-table history-table--sales">
            <div className="history-table__row history-table__row--header">
              <span>Producto</span>
              <span>Comprador</span>
              <span>Oferta</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span>Acción</span>
            </div>

            {ofertasFiltradas.map(
              (oferta) => {
                const procesando =
                  ofertaProcesandoId ===
                  oferta.oferta_id;

                return (
                  <article
                    className="history-table__row"
                    key={
                      oferta.oferta_id
                    }
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
                          <Package
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
                          Oferta #
                          {
                            oferta.oferta_id
                          }
                        </span>

                        <div className="history-offer-message">
                          <MessageSquareText
                            size={14}
                          />

                          <span>
                            {oferta.mensaje?.trim() ||
                              "El comprador no agregó un mensaje."}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="history-buyer">
                      <span className="history-buyer__avatar">
                        <UserRound
                          size={14}
                        />
                      </span>

                      <div>
                        <span>
                          {oferta.comprador_nombre ??
                            "Comprador"}
                        </span>

                        {oferta.comprador_email && (
                          <small>
                            {
                              oferta.comprador_email
                            }
                          </small>
                        )}
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
                      {obtenerTextoEstado(
                        oferta.estado,
                      )}
                    </span>

                    <div className="history-offer-actions">
                      {oferta.estado ===
                      "pendiente" ? (
                        <>
                          <button
                            type="button"
                            disabled={
                              procesando
                            }
                            onClick={() =>
                              void manejarRespuestaOferta(
                                oferta.oferta_id,
                                "aceptada",
                              )
                            }
                          >
                            {procesando
                              ? "Procesando..."
                              : "Aceptar"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              procesando
                            }
                            onClick={() =>
                              void manejarRespuestaOferta(
                                oferta.oferta_id,
                                "rechazada",
                              )
                            }
                          >
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <span>
                          Respondida
                        </span>
                      )}
                    </div>
                  </article>
                );
              },
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

export default SalesHistory;