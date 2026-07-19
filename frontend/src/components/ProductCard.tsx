import {
  Heart,
  MapPin,
} from "lucide-react";
import type { Articulo } from "../interfaces/articulo";

interface ProductCardProps {
  articulo: Articulo;
}

function ProductCard({ articulo }: ProductCardProps) {
  const precioFormateado = Number(
    articulo.precio,
  ).toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  });

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
            Sin imagen
          </div>
        )}

        <span className="product-card__condition">
          {articulo.condicion}
        </span>

        <button
          className="product-card__favorite"
          type="button"
          aria-label="Guardar artículo"
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="product-card__content">
        <span className="product-card__category">
          {articulo.categoria}
        </span>

        <h2>{articulo.titulo}</h2>

        <strong className="product-card__price">
          {precioFormateado}
        </strong>

        <div className="product-card__footer">
          <span>
            <MapPin size={14} />
            {articulo.ubicacion ??
              "Ubicación no indicada"}
          </span>

          <button type="button">
            Ver artículo
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;