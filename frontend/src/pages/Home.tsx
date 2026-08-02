import {
  useEffect,
  useState,
} from "react";

import ProductCard from "../components/ProductCard";
import type { Articulo } from "../interfaces/articulo";
import { obtenerArticulos } from "../services/articuloService";
import { obtenerIdsFavoritos } from "../services/favoritoService";

function Home() {
  const [
    articulos,
    setArticulos,
  ] = useState<Articulo[]>([]);

  const [
    idsFavoritos,
    setIdsFavoritos,
  ] = useState<number[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarArticulos(): Promise<void> {
      try {
        setCargando(true);
        setError("");

        const datos =
          await obtenerArticulos();

        const articulosDisponibles =
          datos.filter(
            (articulo) =>
              articulo.estado ===
                "activo" &&
              Number(
                articulo.archivado,
              ) !== 1 &&
              Number(
                articulo.eliminado ?? 0,
              ) !== 1,
          );

        let favoritos: number[] = [];

        try {
          favoritos =
            await obtenerIdsFavoritos();
        } catch {
          favoritos = [];
        }

        if (!componenteActivo) {
          return;
        }

        setArticulos(
          articulosDisponibles,
        );

        setIdsFavoritos(
          favoritos,
        );
      } catch (
        errorDesconocido
      ) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "Ocurrió un error inesperado";

        if (!componenteActivo) {
          return;
        }

        setError(mensaje);
        setArticulos([]);
        setIdsFavoritos([]);
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
          (id) =>
            id !== articuloId,
        );
      },
    );
  }

  return (
    <section className="home-dashboard home-dashboard--single">
      <div className="home-dashboard__main">
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

            <span>
              {error}
            </span>
          </div>
        ) : cargando ? (
          <p className="status-message">
            Cargando artículos...
          </p>
        ) : articulos.length ===
          0 ? (
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
      </div>
    </section>
  );
}

export default Home;