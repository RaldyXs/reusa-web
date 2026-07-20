import {
  Heart,
  MapPin,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Articulo } from "../interfaces/articulo";

const CLAVE_GUARDADOS = "reusa-articulos-guardados";

interface ProductCardProps {
  articulo: Articulo;
  onSavedChange?: (
    articuloId: number,
    guardado: boolean,
  ) => void;
}

function obtenerIdsGuardados(): number[] {
  try {
    const valorGuardado = localStorage.getItem(CLAVE_GUARDADOS);

    if (!valorGuardado) {
      return [];
    }

    const resultado = JSON.parse(valorGuardado) as unknown;

    if (!Array.isArray(resultado)) {
      return [];
    }

    return resultado.map(Number);
  } catch {
    return [];
  }
}

function ProductCard({
  articulo,
  onSavedChange,
}: ProductCardProps) {
  const navigate = useNavigate();

const [guardado, setGuardado] = useState(() => {
  const idsGuardados = obtenerIdsGuardados();

  return idsGuardados.includes(
    Number(articulo.articulo_id),
  );
});
  

  const precioFormateado = Number(
    articulo.precio,
  ).toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  });

  function abrirDetalle() {
    navigate(`/producto/${articulo.articulo_id}`);
  }

  function alternarGuardado() {
    const articuloId = Number(articulo.articulo_id);
    const idsGuardados = obtenerIdsGuardados();

    const yaEstaGuardado =
      idsGuardados.includes(articuloId);

    const nuevosIds = yaEstaGuardado
      ? idsGuardados.filter((id) => id !== articuloId)
      : [...idsGuardados, articuloId];

    localStorage.setItem(
      CLAVE_GUARDADOS,
      JSON.stringify(nuevosIds),
    );

    const nuevoEstado = !yaEstaGuardado;

    setGuardado(nuevoEstado);
    onSavedChange?.(articuloId, nuevoEstado);
  }

  return (
    <article className="product-card">
      <div className="product-card__image-container">
        {articulo.imagen_principal ? (
          <img
            src={articulo.imagen_principal}
            alt={articulo.titulo}
            className="product-card__image"
          />
        ) : (
          <div className="product-card__placeholder">
            {articulo.titulo}
          </div>
        )}

        <span className="product-card__condition">
          {articulo.condicion}
        </span>

        <button
          className={
            guardado
              ? "product-card__favorite product-card__favorite--active"
              : "product-card__favorite"
          }
          type="button"
          aria-label={
            guardado
              ? `Quitar ${articulo.titulo} de guardados`
              : `Guardar ${articulo.titulo}`
          }
          title={
            guardado
              ? "Quitar de guardados"
              : "Guardar artículo"
          }
          onClick={alternarGuardado}
        >
          <Heart
            size={18}
            fill={guardado ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="product-card__content">
        <div className="product-card__price-row">
          <strong className="product-card__price">
            {precioFormateado}
          </strong>

          <span className="product-card__time">
            Hace poco
          </span>
        </div>

        <h2>{articulo.titulo}</h2>

        <div className="product-card__location">
          <MapPin size={14} />

          <span>
            {articulo.ubicacion ??
              "Ubicación no indicada"}
          </span>
        </div>

        <div className="product-card__footer">
          <div className="product-card__seller">
            <span className="product-card__seller-avatar">
              <UserRound size={14} />
            </span>

            <span>
              {articulo.vendedor ?? "Vendedor"}
            </span>
          </div>

          <button
            type="button"
            onClick={abrirDetalle}
          >
            Ver producto
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;