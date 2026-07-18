import type { Articulo } from "../interfaces/articulo";

interface ProductCardProps {
  articulo: Articulo;
}

function ProductCard({ articulo }: ProductCardProps) {
  const precioFormateado = Number(articulo.precio).toLocaleString(
    "es-DO",
    {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    },
  );

  return (
    <article className="product-card">
      <div className="product-image-container">
        {articulo.imagen_principal ? (
          <img
            src={articulo.imagen_principal}
            alt={articulo.titulo}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            Sin imagen
          </div>
        )}
      </div>

      <div className="product-card-content">
        <span className="product-category">
          {articulo.categoria}
        </span>

        <h2>{articulo.titulo}</h2>

        <p className="product-price">{precioFormateado}</p>

        <p className="product-condition">
          Condición: {articulo.condicion}
        </p>

        <p className="product-location">
          {articulo.ubicacion ?? "Ubicación no indicada"}
        </p>

        <p className="product-seller">
          Publicado por: {articulo.vendedor}
        </p>
      </div>
    </article>
  );
}

export default ProductCard;