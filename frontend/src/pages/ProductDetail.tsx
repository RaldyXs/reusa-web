import {
  ArrowLeft,
  Bookmark,
  MapPin,
  MessageSquare,
  Share2,
  Tag,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import type { Articulo } from "../interfaces/articulo";
import { obtenerArticuloPorId } from "../services/articuloService";

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [articulo, setArticulo] =
    useState<Articulo | null>(null);

  const [imagenSeleccionada, setImagenSeleccionada] =
    useState<string | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarArticulo() {
      try {
        setCargando(true);
        setError("");

        const articuloId = Number(id);

        if (
          !Number.isInteger(articuloId) ||
          articuloId < 1
        ) {
          throw new Error(
            "El identificador del artículo no es válido",
          );
        }

        const datos =
          await obtenerArticuloPorId(articuloId);

        if (!componenteActivo) {
          return;
        }

        setArticulo(datos);

        setImagenSeleccionada(
          datos.imagenes?.[0] ??
            datos.imagen_principal ??
            null,
        );
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "Ocurrió un error inesperado";

        if (componenteActivo) {
          setError(mensaje);
          setArticulo(null);
          setImagenSeleccionada(null);
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    void cargarArticulo();

    return () => {
      componenteActivo = false;
    };
  }, [id]);

  if (cargando) {
    return (
      <p className="status-message">
        Cargando artículo...
      </p>
    );
  }

  if (error || !articulo) {
    return (
      <section className="product-detail-error">
        <h1>No pudimos cargar el artículo</h1>

        <p>{error || "El artículo no existe."}</p>

        <button
          type="button"
          onClick={() => navigate("/marketplace")}
        >
          Volver al marketplace
        </button>
      </section>
    );
  }

  const precioFormateado = Number(
    articulo.precio,
  ).toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  });

  const imagenes =
    articulo.imagenes &&
    articulo.imagenes.length > 0
      ? articulo.imagenes
      : articulo.imagen_principal
        ? [articulo.imagen_principal]
        : [];

  return (
    <section className="product-detail-page">
      <button
        className="product-detail-back"
        type="button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="product-detail-layout">
        <div className="product-detail-gallery">
          <div className="product-detail-main-image">
            {imagenSeleccionada ? (
              <img
                src={imagenSeleccionada}
                alt={articulo.titulo}
              />
            ) : (
              <div className="product-detail-placeholder">
                {articulo.titulo}
              </div>
            )}

            <span className="product-detail-condition">
              {articulo.condicion}
            </span>
          </div>

          {imagenes.length > 0 && (
            <div className="product-detail-thumbnails">
              {imagenes.map((imagen, indice) => (
                <button
                  type="button"
                  key={`${imagen}-${indice}`}
                  className={
                    imagenSeleccionada === imagen
                      ? "product-detail-thumbnail product-detail-thumbnail--active"
                      : "product-detail-thumbnail"
                  }
                  onClick={() =>
                    setImagenSeleccionada(imagen)
                  }
                  aria-label={`Mostrar imagen ${indice + 1}`}
                >
                  <img
                    src={imagen}
                    alt={`${articulo.titulo} ${indice + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="product-detail-information">
          <span className="product-detail-category">
            {articulo.categoria}
          </span>

          <h1>{articulo.titulo}</h1>

          <strong className="product-detail-price">
            {precioFormateado}
          </strong>

          <div className="product-detail-location">
            <MapPin size={16} />

            <span>
              {articulo.ubicacion ??
                "Ubicación no indicada"}
            </span>
          </div>

          <button
            className="product-detail-contact"
            type="button"
          >
            <MessageSquare size={18} />
            Contactar al vendedor
          </button>

          <div className="product-detail-secondary-actions">
            <button type="button">
              <Bookmark size={17} />
              Guardar
            </button>

            <button type="button">
              <Share2 size={17} />
              Compartir
            </button>
          </div>

          <section className="product-detail-card">
            <h2>Detalles</h2>

            <dl>
              <div>
                <dt>Condición</dt>
                <dd>{articulo.condicion}</dd>
              </div>

              <div>
                <dt>Categoría</dt>
                <dd>{articulo.categoria}</dd>
              </div>

              <div>
                <dt>Ubicación</dt>
                <dd>
                  {articulo.ubicacion ??
                    "No indicada"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="product-detail-card">
            <h2>Descripción</h2>

            <p>
              {articulo.descripcion?.trim() ||
                "El vendedor todavía no ha agregado una descripción para este artículo."}
            </p>
          </section>

          <section className="product-detail-seller">
            <div className="product-detail-seller-avatar">
              <UserRound size={22} />
            </div>

            <div>
              <span>Vendido por</span>

              <strong>
                {articulo.vendedor ?? "Vendedor"}
              </strong>
            </div>

            <Tag size={18} />
          </section>
        </aside>
      </div>
    </section>
  );
}

export default ProductDetail;