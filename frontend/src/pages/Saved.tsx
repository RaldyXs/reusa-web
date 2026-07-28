import {
  BookmarkX,
  Heart,
  ShoppingBag,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "../components/ProductCard";

import {
  obtenerFavoritos,
  type ArticuloFavorito,
} from "../services/favoritoService";

function Saved() {
  const navigate = useNavigate();

  const [articulos, setArticulos] =
    useState<ArticuloFavorito[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const cargarGuardados =
    useCallback(async (): Promise<void> => {
      try {
        setCargando(true);
        setError("");

        const favoritosRecibidos =
          await obtenerFavoritos();

        setArticulos(
          favoritosRecibidos,
        );
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
    }, []);

  useEffect(() => {
    let componenteActivo = true;

    async function iniciarCarga() {
      try {
        const favoritosRecibidos =
          await obtenerFavoritos();

        if (componenteActivo) {
          setArticulos(
            favoritosRecibidos,
          );
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

    void iniciarCarga();

    return () => {
      componenteActivo = false;
    };
  }, []);

  function manejarCambioGuardado(
    articuloId: number,
    guardado: boolean,
  ): void {
    if (guardado) {
      return;
    }

    setArticulos(
      (articulosActuales) =>
        articulosActuales.filter(
          (articulo) =>
            Number(
              articulo.articulo_id,
            ) !== articuloId,
        ),
    );
  }

  return (
    <section className="saved-page">
      <header className="saved-page__header">
        <div>
          <span>Mi cuenta</span>

          <h1>Artículos guardados</h1>

          <p>
            Consulta los productos que
            marcaste para verlos más tarde.
          </p>
        </div>

        <div className="saved-page__counter">
          <Heart size={18} />

          <span>
            {articulos.length}{" "}
            {articulos.length === 1
              ? "artículo"
              : "artículos"}
          </span>
        </div>
      </header>

      {error ? (
        <div
          className="error-message"
          role="alert"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              void cargarGuardados()
            }
          >
            Intentar nuevamente
          </button>
        </div>
      ) : cargando ? (
        <p className="status-message">
          Cargando artículos guardados...
        </p>
      ) : articulos.length === 0 ? (
        <div className="saved-page__empty">
          <span className="saved-page__empty-icon">
            <BookmarkX size={34} />
          </span>

          <h2>
            No tienes artículos guardados
          </h2>

          <p>
            Pulsa el corazón de una
            publicación para guardarla aquí.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/marketplace")
            }
          >
            <ShoppingBag size={18} />
            Explorar marketplace
          </button>
        </div>
      ) : (
        <section
          className="products-grid"
          aria-label="Artículos guardados"
        >
          {articulos.map(
            (articulo) => (
              <ProductCard
                key={
                  articulo.articulo_id
                }
                articulo={articulo}
                inicialmenteGuardado
                onSavedChange={
                  manejarCambioGuardado
                }
              />
            ),
          )}
        </section>
      )}
    </section>
  );
}

export default Saved;