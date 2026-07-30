import {
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  MessageSquareText,
  Package,
  Store,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  obtenerOfertasRealizadas,
  responderContraoferta,
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
    contraoferta:
      "Contraoferta recibida",
  };

  return textos[estado];
}

function PurchaseHistory() {
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
    mensajeExito,
    setMensajeExito,
  ] = useState("");

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
          await obtenerOfertasRealizadas();

        setOfertas(datos);
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar las ofertas realizadas";

        setError(mensaje);
        setOfertas([]);
      } finally {
        setCargando(false);
      }
    }, []);

  useEffect(() => {
    async function inicializar(): Promise<void> {
      await cargarOfertas();
    }

    void inicializar();
  }, [cargarOfertas]);

  async function manejarContraoferta(
    ofertaId: number,
    aceptar: boolean,
  ): Promise<void> {
    const confirmado =
      window.confirm(
        aceptar
          ? "¿Deseas aceptar esta contraoferta? El artículo será marcado como vendido."
          : "¿Deseas rechazar esta contraoferta?",
      );

    if (!confirmado) {
      return;
    }

    try {
      setOfertaProcesandoId(
        ofertaId,
      );

      setError("");
      setMensajeExito("");

      await responderContraoferta(
        ofertaId,
        aceptar,
      );

      setMensajeExito(
        aceptar
          ? "Contraoferta aceptada correctamente"
          : "Contraoferta rechazada correctamente",
      );

      await cargarOfertas();
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo responder la contraoferta";

      setError(mensaje);
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

  const comprasAceptadas =
    ofertas.filter(
      (oferta) =>
        oferta.estado === "aceptada",
    );

  const totalComprado =
    comprasAceptadas.reduce(
      (total, oferta) => {
        const precioFinal =
          oferta.precio_contraoferta ??
          oferta.precio_ofertado;

        return (
          total +
          Number(precioFinal)
        );
      },
      0,
    );

  const ofertasPendientes =
    ofertas.filter(
      (oferta) =>
        oferta.estado === "pendiente",
    ).length;

  const contraofertasPendientes =
    ofertas.filter(
      (oferta) =>
        oferta.estado ===
        "contraoferta",
    ).length;

  return (
    <section className="history-page">
      <header className="history-page__header">
        <div>
          <span>Mi cuenta</span>

          <h1>
            Historial de compras
          </h1>

          <p>
            Consulta tus ofertas y responde
            las contraofertas recibidas.
          </p>
        </div>

        <div className="history-page__filters">
          <select
            aria-label="Filtrar compras por estado"
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

            <option value="contraoferta">
              Contraofertas
            </option>

            <option value="aceptada">
              Aceptadas
            </option>

            <option value="rechazada">
              Rechazadas
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
                totalComprado,
              )}
            </strong>

            <span>
              Total comprado
            </span>
          </div>
        </article>

        <article>
          <Clock3 size={21} />

          <div>
            <strong>
              {ofertasPendientes}
            </strong>

            <span>
              Ofertas pendientes
            </span>
          </div>
        </article>

        <article>
          <MessageSquareText
            size={21}
          />

          <div>
            <strong>
              {contraofertasPendientes}
            </strong>

            <span>
              Contraofertas recibidas
            </span>
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

      {mensajeExito && (
        <div
          className="success-message"
          role="status"
        >
          {mensajeExito}
        </div>
      )}

      {cargando ? (
        <p className="status-message">
          Cargando historial de compras...
        </p>
      ) : (
        <section className="history-card">
          <div className="history-table history-table--purchases">
            <div className="history-table__row history-table__row--header">
              <span>Producto</span>
              <span>Vendedor</span>
              <span>Mi oferta</span>
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

                        {oferta.mensaje && (
                          <div className="history-offer-message">
                            <MessageSquareText
                              size={14}
                            />

                            <span>
                              {oferta.mensaje}
                            </span>
                          </div>
                        )}

                        {oferta.estado ===
                          "contraoferta" && (
                          <div className="history-offer-message">
                            <MessageSquareText
                              size={14}
                            />

                            <span>
                              {oferta.mensaje_contraoferta?.trim() ||
                                "El vendedor envió una nueva propuesta."}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="history-buyer">
                      <span className="history-buyer__avatar">
                        <Store size={14} />
                      </span>

                      <div>
                        <span>
                          {oferta.vendedor_nombre ??
                            "Vendedor"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <strong className="history-price">
                        {formatearPrecio(
                          oferta.precio_ofertado,
                        )}
                      </strong>

                      {oferta.precio_contraoferta && (
                        <small>
                          Nueva propuesta:{" "}
                          {formatearPrecio(
                            oferta.precio_contraoferta,
                          )}
                        </small>
                      )}
                    </div>

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
                      "contraoferta" ? (
                        <>
                          <button
                            type="button"
                            disabled={
                              procesando
                            }
                            onClick={() =>
                              void manejarContraoferta(
                                oferta.oferta_id,
                                true,
                              )
                            }
                          >
                            <Check
                              size={15}
                            />

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
                              void manejarContraoferta(
                                oferta.oferta_id,
                                false,
                              )
                            }
                          >
                            <X size={15} />

                            Rechazar
                          </button>
                        </>
                      ) : (
                        <span>
                          {oferta.estado ===
                          "pendiente"
                            ? "Esperando respuesta"
                            : "Finalizada"}
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
              No hay compras con ese estado.
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