import {
  CalendarDays,
  MoreVertical,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";

type EstadoCompra = "Entregado" | "En camino" | "Procesando";

interface Compra {
  id: number;
  producto: string;
  vendedor: string;
  precio: number;
  fecha: string;
  estado: EstadoCompra;
}

const comprasIniciales: Compra[] = [
  {
    id: 1,
    producto: "Audífonos inalámbricos",
    vendedor: "Carlos Martínez",
    precio: 2950,
    fecha: "15 mayo 2026",
    estado: "Entregado",
  },
  {
    id: 2,
    producto: "Lámpara de mesa",
    vendedor: "Elena Rodríguez",
    precio: 1850,
    fecha: "12 mayo 2026",
    estado: "En camino",
  },
  {
    id: 3,
    producto: "Teclado mecánico",
    vendedor: "Juan Pérez",
    precio: 4200,
    fecha: "8 mayo 2026",
    estado: "Procesando",
  },
];

function PurchaseHistory() {
  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState("todos");

  const comprasFiltradas =
    estadoSeleccionado === "todos"
      ? comprasIniciales
      : comprasIniciales.filter(
          (compra) =>
            compra.estado === estadoSeleccionado,
        );

  return (
    <section className="history-page">
      <header className="history-page__header">
        <div>
          <span>Mi cuenta</span>

          <h1>Historial de compras</h1>

          <p>
            Revisa el estado de tus compras recientes y
            anteriores.
          </p>
        </div>

        <div className="history-page__filters">
          <select
            aria-label="Filtrar compras por estado"
            value={estadoSeleccionado}
            onChange={(event) =>
              setEstadoSeleccionado(event.target.value)
            }
          >
            <option value="todos">Todos los estados</option>
            <option value="Entregado">Entregado</option>
            <option value="En camino">En camino</option>
            <option value="Procesando">Procesando</option>
          </select>

          <button type="button">
            <CalendarDays size={16} />
            Últimos 30 días
          </button>
        </div>
      </header>

      <section className="history-card">
        <div className="history-table history-table--purchases">
          <div className="history-table__row history-table__row--header">
            <span>Producto</span>
            <span>Precio</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span>Acción</span>
          </div>

          {comprasFiltradas.map((compra) => (
            <article
              className="history-table__row"
              key={compra.id}
            >
              <div className="history-product">
                <span className="history-product__image">
                  <ShoppingBag size={20} />
                </span>

                <div>
                  <strong>{compra.producto}</strong>
                  <span>Vendedor: {compra.vendedor}</span>
                </div>
              </div>

              <strong className="history-price">
                {compra.precio.toLocaleString("es-DO", {
                  style: "currency",
                  currency: "DOP",
                  maximumFractionDigits: 0,
                })}
              </strong>

              <span>{compra.fecha}</span>

              <span
                className={`history-status history-status--${compra.estado
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                <PackageCheck size={13} />
                {compra.estado}
              </span>

              <button
                className="history-action"
                type="button"
                aria-label={`Opciones para ${compra.producto}`}
              >
                <MoreVertical size={18} />
              </button>
            </article>
          ))}
        </div>

        {comprasFiltradas.length === 0 && (
          <p className="status-message">
            No hay compras con ese estado.
          </p>
        )}

        <footer className="history-card__footer">
          Mostrando {comprasFiltradas.length} de{" "}
          {comprasIniciales.length} compras
        </footer>
      </section>
    </section>
  );
}

export default PurchaseHistory;