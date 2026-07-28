import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import FeaturedPanel from "../components/FeaturedPanel";
import ProductCard from "../components/ProductCard";
import type { Articulo } from "../interfaces/articulo";
import { obtenerArticulos } from "../services/articuloService";
import { obtenerIdsFavoritos } from "../services/favoritoService";

function Home() {
  const [articulos, setArticulos] =
    useState<Articulo[]>([]);

  const [idsFavoritos, setIdsFavoritos] =
    useState<number[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarArticulos() {
      try {
        setCargando(true);
        setError("");

        const datos =
          await obtenerArticulos();

        let favoritos: number[] = [];

        try {
          favoritos =
            await obtenerIdsFavoritos();
        } catch {
          favoritos = [];
        }

        if (componenteActivo) {
          setArticulos(datos);
          setIdsFavoritos(favoritos);
        }
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "Ocurrió un error inesperado";

        if (componenteActivo) {
          setError(mensaje);
          setArticulos([]);
          setIdsFavoritos([]);
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

  function manejarCambioGuardado(
    articuloId: number,
    guardado: boolean,
  ): void {
    setIdsFavoritos(
      (idsActuales) => {
        if (guardado) {
          if (
            idsActuales.includes(
              articuloId,
            )
          ) {
            return idsActuales;
          }

          return [
            ...idsActuales,
            articuloId,
          ];
        }

        return idsActuales.filter(
          (id) => id !== articuloId,
        );
      },
    );
  }

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
              Explora los artículos
              publicados recientemente en
              tu comunidad.
            </p>
          </div>

          <button
            className="filter-button"
            type="button"
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal
              size={17}
            />

            <span>Filtros</span>
          </button>
        </header>

        {error ? (
          <div
            className="error-message"
            role="alert"
          >
            <strong>
              No pudimos cargar los
              artículos.
            </strong>

            <span>{error}</span>
          </div>
        ) : cargando ? (
          <p className="status-message">
            Cargando artículos...
          </p>
        ) : articulos.length === 0 ? (
          <p className="status-message">
            No hay artículos disponibles.
          </p>
        ) : (
          <>
            <div className="results-header">
              <h2>
                Publicaciones recientes
              </h2>

              <span>
                {articulos.length}{" "}
                {articulos.length === 1
                  ? "artículo"
                  : "artículos"}
              </span>
            </div>

            <section
              className="products-grid"
              aria-label="Publicaciones recientes"
            >
              {articulos.map(
                (articulo) => {
                  const articuloId =
                    Number(
                      articulo.articulo_id,
                    );

                  return (
                    <ProductCard
                      key={articuloId}
                      articulo={articulo}
                      inicialmenteGuardado={
                        idsFavoritos.includes(
                          articuloId,
                        )
                      }
                      onSavedChange={
                        manejarCambioGuardado
                      }
                    />
                  );
                },
              )}
            </section>
          </>
        )}
      </section>

      <FeaturedPanel />
    </div>
  );
}

export default Home;