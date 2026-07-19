import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import FeaturedPanel from "../components/FeaturedPanel";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import type { Articulo } from "../interfaces/articulo";
import {
  buscarArticulos,
  obtenerArticulos,
} from "../services/articuloService";

function Home() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function manejarBusqueda(termino: string) {
    try {
      setCargando(true);
      setError("");

      const terminoLimpio = termino.trim();

      const datos = terminoLimpio
        ? await buscarArticulos(terminoLimpio)
        : await obtenerArticulos();

      setArticulos(datos);
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "Ocurrió un error inesperado";

      setError(mensaje);
      setArticulos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let componenteActivo = true;

    async function cargarArticulos() {
      try {
        setCargando(true);
        setError("");

        const datos = await obtenerArticulos();

        if (componenteActivo) {
          setArticulos(datos);
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

    void cargarArticulos();

    return () => {
      componenteActivo = false;
    };
  }, []);

  return (
    <div className="home-dashboard">
      <section className="home-dashboard__main">
        <header className="discover-header">
          <div>
            <span className="discover-header__eyebrow">
              Marketplace
            </span>

            <h1>Descubre</h1>

            <p>
              Explora los artículos publicados recientemente
              en tu comunidad.
            </p>
          </div>

          <button
            className="filter-button"
            type="button"
          >
            <SlidersHorizontal size={17} />
            <span>Filtros</span>
          </button>
        </header>

        <SearchBar
          onSearch={manejarBusqueda}
          cargando={cargando}
        />

        {error ? (
          <div className="error-message" role="alert">
            <strong>No pudimos cargar los artículos.</strong>
            <span>{error}</span>
          </div>
        ) : cargando ? (
          <p className="status-message">
            Cargando artículos...
          </p>
        ) : articulos.length === 0 ? (
          <p className="status-message">
            No se encontraron artículos.
          </p>
        ) : (
          <>
            <div className="results-header">
              <h2>Publicaciones recientes</h2>

              <span>
                {articulos.length}{" "}
                {articulos.length === 1
                  ? "artículo"
                  : "artículos"}
              </span>
            </div>

            <section className="products-grid">
              {articulos.map((articulo) => (
                <ProductCard
                  key={articulo.articulo_id}
                  articulo={articulo}
                />
              ))}
            </section>
          </>
        )}
      </section>

      <FeaturedPanel />
    </div>
  );
}

export default Home;