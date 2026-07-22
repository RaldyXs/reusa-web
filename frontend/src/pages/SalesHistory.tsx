import {
  CalendarDays,
  CircleDollarSign,
  MoreVertical,
  Package,
  UserRound,
} from "lucide-react";
import { useState } from "react";

type EstadoVenta = "Completada" | "Pendiente" | "Cancelada";

interface Venta {
  id: number;
  producto: string;
  comprador: string;
  precio: number;
  fecha: string;
  estado: EstadoVenta;
}

const ventasIniciales: Venta[] = [
  {
    id: 1,
    producto: "Juego de comedor",
    comprador: "María López",
    precio: 12500,
    fecha: "16 mayo 2026",
    estado: "Completada",
  },
  {
    id: 2,
    producto: "iPhone 12",
    comprador: "Pedro Ramírez",
    precio: 22000,
    fecha: "13 mayo 2026",
    estado: "Pendiente",
  },
  {
    id: 3,
    producto: "Bicicleta montañera",
    comprador: "Laura Gómez",
    precio: 18500,
    fecha: "7 mayo 2026",
    estado: "Cancelada",
  },
];

function SalesHistory() {
  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState("todos");

  const ventasFiltradas =
    estadoSeleccionado === "todos"
      ? ventasIniciales
      : ventasIniciales.filter(
          (venta) => venta.estado === estadoSeleccionado,
        );

  const totalVendido = ventasIniciales
    .filter((venta) => venta.estado === "Completada")
    .reduce((total, venta) => total + venta.precio, 0);

  return (
    <section className="history-page">
      <header className="history-page__header">
        <div>
          <span>Mi cuenta</span>

          <h1>Historial de ventas</h1>

          <p>
            Revisa tus ventas, compradores y estados de cada
            operación.
          </p>
        </div>

        <div className="history-page__filters">
          <select
            aria-label="Filtrar ventas por estado"
            value={estadoSeleccionado}
            onChange={(event) =>
              setEstadoSeleccionado(event.target.value)
            }
          >
            <option value="todos">Todos los estados</option>
            <option value="Completada">Completada</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Cancelada">Cancelada</option>
          </select>

          <button type="button">
            <CalendarDays size={16} />
            Últimos 30 días
          </button>
        </div>
      </header>

      <div className="sales-summary">
        <article>
          <CircleDollarSign size={21} />

          <div>
            <strong>
              {totalVendido.toLocaleString("es-DO", {
                style: "currency",
                currency: "DOP",
                maximumFractionDigits: 0,
              })}
            </strong>

            <span>Total vendido</span>
          </div>
        </article>

        <article>
          <Package size={21} />

          <div>
            <strong>{ventasIniciales.length}</strong>
            <span>Operaciones</span>
          </div>
        </article>

        <article>
          <UserRound size={21} />

          <div>
            <strong>
              {
                ventasIniciales.filter(
                  (venta) => venta.estado === "Pendiente",
                ).length
              }
            </strong>

            <span>Pendientes</span>
          </div>
        </article>
      </div>

      <section className="history-card">
        <div className="history-table history-table--sales">
          <div className="history-table__row history-table__row--header">
            <span>Producto</span>
            <span>Comprador</span>
            <span>Precio</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span>Acción</span>
          </div>

          {ventasFiltradas.map((venta) => (
            <article
              className="history-table__row"
              key={venta.id}
            >
              <div className="history-product">
                <span className="history-product__image">
                  <Package size={20} />
                </span>

                <div>
                  <strong>{venta.producto}</strong>
                  <span>Venta #{venta.id}</span>
                </div>
              </div>

              <div className="history-buyer">
                <span className="history-buyer__avatar">
                  <UserRound size={14} />
                </span>

                <span>{venta.comprador}</span>
              </div>

              <strong className="history-price">
                {venta.precio.toLocaleString("es-DO", {
                  style: "currency",
                  currency: "DOP",
                  maximumFractionDigits: 0,
                })}
              </strong>

              <span>{venta.fecha}</span>

              <span
                className={`history-status history-status--${venta.estado.toLowerCase()}`}
              >
                {venta.estado}
              </span>

              <button
                className="history-action"
                type="button"
                aria-label={`Opciones para ${venta.producto}`}
              >
                <MoreVertical size={18} />
              </button>
            </article>
          ))}
        </div>

        {ventasFiltradas.length === 0 && (
          <p className="status-message">
            No hay ventas con ese estado.
          </p>
        )}

        <footer className="history-card__footer">
          Mostrando {ventasFiltradas.length} de{" "}
          {ventasIniciales.length} ventas
        </footer>
      </section>
    </section>
  );
}

export default SalesHistory;