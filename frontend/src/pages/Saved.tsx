import { BookmarkX, Heart, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import type { Articulo } from "../interfaces/articulo";
import { obtenerArticulos } from "../services/articuloService";

const CLAVE_GUARDADOS = "reusa-articulos-guardados";

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

    return resultado
      .map(Number)
      .filter(
        (articuloId) =>
          Number.isInteger(articuloId) && articuloId > 0,
      );
  } catch {
    return [];
  }
}

function Saved() {
  const navigate = useNavigate();

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarGuardados() {
      try {
        setCargando(true);
        setError("");

        const idsGuardados = obtenerIdsGuardados();

        if (idsGuardados.length === 0) {
          if (componenteActivo) {
            setArticulos([]);
          }

          return;
        }

        const todosLosArticulos = await obtenerArticulos();

        const articulosGuardados = todosLosArticulos.filter(
          (articulo) =>
            idsGuardados.includes(
              Number(articulo.articulo_id),
            ),
        );

        if (componenteActivo) {
          setArticulos(articulosGuardados);
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

    void cargarGuardados();

    return () => {
      componenteActivo = false;
    };
  }, []);

  function manejarCambioGuardado(
    articuloId: number,
    guardado: boolean,
  ) {
    if (!guardado) {
      setArticulos((articulosActuales) =>
        articulosActuales.filter(
          (articulo) =>
            articulo.articulo_id !== articuloId,
        ),
      );
    }
  }

  return (
    <section className="saved-page">
      <header className="saved-page__header">
        <div>
          <span>Mi cuenta</span>

          <h1>Artículos guardados</h1>

          <p>
            Consulta los productos que marcaste para verlos más
            tarde.
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
        <div className="error-message" role="alert">
          {error}
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

          <h2>No tienes artículos guardados</h2>

          <p>
            Pulsa el corazón de una publicación para guardarla
            aquí.
          </p>

          <button
            type="button"
            onClick={() => navigate("/marketplace")}
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
          {articulos.map((articulo) => (
            <ProductCard
              key={articulo.articulo_id}
              articulo={articulo}
              onSavedChange={manejarCambioGuardado}
            />
          ))}
        </section>
      )}
    </section>
  );
}

export default Saved;