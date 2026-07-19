import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import type { Articulo } from "../interfaces/articulo";
import {
  buscarArticulos,
  obtenerArticulos,
} from "../services/articuloService";

function SearchResults() {
  const [searchParams] = useSearchParams();

  const termino = searchParams.get("busqueda")?.trim() ?? "";
  const categoria = searchParams.get("categoria")?.trim() ?? "";

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarResultados() {
      try {
        setCargando(true);
        setError("");

        const datos = termino
          ? await buscarArticulos(termino)
          : await obtenerArticulos();

        const resultadosFiltrados = categoria
          ? datos.filter(
              (articulo) =>
                articulo.categoria?.toLowerCase() ===
                categoria.toLowerCase(),
            )
          : datos;

        if (componenteActivo) {
          setArticulos(resultadosFiltrados);
        }
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "Ocurrió un error inesperado";

        if (componenteActivo) {
          setError(mensaje);
          setArticulos([]);
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    void cargarResultados();

    return () => {
      componenteActivo = false;
    };
  }, [termino, categoria]);

  const titulo = termino
    ? `Resultados para “${termino}”`
    : categoria
      ? categoria
      : "Marketplace";

  return (
    <section className="search-results-page">
      <aside className="search-filters">
        <div className="search-filters__header">
          <h2>Filtros</h2>

          <button type="button">
            Limpiar
          </button>
        </div>

        <div className="search-filter-group">
          <h3>Categoría</h3>

          <label>
            <input type="checkbox" />
            Electrónica
          </label>

          <label>
            <input type="checkbox" />
            Hogar
          </label>

          <label>
            <input type="checkbox" />
            Vehículos
          </label>
        </div>

        <div className="search-filter-group">
          <h3>Rango de precio</h3>

          <div className="search-price-range">
            <input type="number" placeholder="Mínimo" />
            <input type="number" placeholder="Máximo" />
          </div>
        </div>

        <div className="search-filter-group">
          <h3>Condición</h3>

          <div className="search-condition-buttons">
            <button type="button">Nuevo</button>
            <button type="button">Usado</button>
          </div>
        </div>
      </aside>

      <div className="search-results-page__content">
        <header className="search-results-header">
          <div>
            <span>Marketplace</span>
            <h1>{titulo}</h1>

            <p>
              {cargando
                ? "Buscando publicaciones..."
                : `${articulos.length} publicaciones encontradas`}
            </p>
          </div>

          <button
            className="filter-button"
            type="button"
          >
            <SlidersHorizontal size={17} />
            Más filtros
          </button>
        </header>

        {error ? (
          <div className="error-message" role="alert">
            {error}
          </div>
        ) : cargando ? (
          <p className="status-message">
            Cargando resultados...
          </p>
        ) : articulos.length === 0 ? (
          <p className="status-message">
            No se encontraron artículos.
          </p>
        ) : (
          <section className="products-grid">
            {articulos.map((articulo) => (
              <ProductCard
                key={articulo.articulo_id}
                articulo={articulo}
              />
            ))}
          </section>
        )}
      </div>
    </section>
  );
}

export default SearchResults;