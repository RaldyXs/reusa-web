import {
  Heart,
  MapPin,
  UserRound,
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
            {articulo.titulo}
          </div>
        )}

        <span className="product-card__condition">
          {articulo.condicion}
        </span>

        <button
          className="product-card__favorite"
          type="button"
          aria-label={`Guardar ${articulo.titulo}`}
        >
          <Heart size={18} />
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

            <span>Vendedor</span>
          </div>

          <button type="button">
            Ver producto
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;