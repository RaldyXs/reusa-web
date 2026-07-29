import {
  Grid2X2,
  PackageSearch,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ProductCard from "../components/ProductCard";
import type { Articulo } from "../interfaces/articulo";
import { obtenerArticulos } from "../services/articuloService";
import { obtenerIdsFavoritos } from "../services/favoritoService";

interface CategoriaResumen {
  nombre: string;
  cantidad: number;
}

function Categories() {
  const [articulos, setArticulos] =
    useState<Articulo[]>([]);

  const [idsFavoritos, setIdsFavoritos] =
    useState<number[]>([]);

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState<string | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError("");

        const articulosRecibidos =
          await obtenerArticulos();

        const articulosDisponibles =
          articulosRecibidos.filter(
            (articulo) =>
              articulo.estado ===
                "activo" &&
              Number(
                articulo.archivado,
              ) !== 1,
          );

        let favoritos: number[] = [];

        try {
          favoritos =
            await obtenerIdsFavoritos();
        } catch {
          favoritos = [];
        }

        if (componenteActivo) {
          setArticulos(
            articulosDisponibles,
          );

          setIdsFavoritos(
            favoritos,
          );
        }
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar las categorías";

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

    void cargarDatos();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const categorias = useMemo<
    CategoriaResumen[]
  >(() => {
    const cantidades =
      new Map<string, number>();

    articulos.forEach(
      (articulo) => {
        const categoria =
          articulo.categoria?.trim();

        if (!categoria) {
          return;
        }

        cantidades.set(
          categoria,
          (cantidades.get(
            categoria,
          ) ?? 0) + 1,
        );
      },
    );

    return Array.from(
      cantidades.entries(),
    )
      .map(
        ([nombre, cantidad]) => ({
          nombre,
          cantidad,
        }),
      )
      .sort(
        (
          categoriaA,
          categoriaB,
        ) =>
          categoriaA.nombre.localeCompare(
            categoriaB.nombre,
            "es",
          ),
      );
  }, [articulos]);

  const articulosCategoria =
    useMemo(() => {
      if (!categoriaSeleccionada) {
        return [];
      }

      return articulos.filter(
        (articulo) =>
          articulo.categoria ===
          categoriaSeleccionada,
      );
    }, [
      articulos,
      categoriaSeleccionada,
    ]);

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
    <section className="categories-page">
      <header className="categories-page__header">
        <div>
          <span>Marketplace</span>

          <h1>Categorías</h1>

          <p>
            Explora los artículos
            disponibles por categoría.
          </p>
        </div>

        <div className="categories-page__summary">
          <Grid2X2 size={19} />

          <span>
            {categorias.length}{" "}
            {categorias.length === 1
              ? "categoría"
              : "categorías"}
          </span>
        </div>
      </header>

      {error ? (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      ) : cargando ? (
        <p className="status-message">
          Cargando categorías...
        </p>
      ) : categorias.length === 0 ? (
        <div className="categories-page__empty">
          <PackageSearch
            size={36}
          />

          <h2>
            No hay categorías disponibles
          </h2>

          <p>
            Todavía no existen artículos
            activos para mostrar.
          </p>
        </div>
      ) : (
        <>
          <section
            className="categories-grid"
            aria-label="Categorías disponibles"
          >
            {categorias.map(
              (categoria) => (
                <button
                  type="button"
                  key={categoria.nombre}
                  className={
                    categoriaSeleccionada ===
                    categoria.nombre
                      ? "category-card category-card--active"
                      : "category-card"
                  }
                  onClick={() =>
                    setCategoriaSeleccionada(
                      categoria.nombre,
                    )
                  }
                >
                  <span className="category-card__icon">
                    <Grid2X2
                      size={22}
                    />
                  </span>

                  <strong>
                    {categoria.nombre}
                  </strong>

                  <span>
                    {categoria.cantidad}{" "}
                    {categoria.cantidad ===
                    1
                      ? "artículo"
                      : "artículos"}
                  </span>
                </button>
              ),
            )}
          </section>

          {categoriaSeleccionada ? (
            <section className="categories-results">
              <header className="results-header">
                <div>
                  <h2>
                    {
                      categoriaSeleccionada
                    }
                  </h2>

                  <span>
                    {
                      articulosCategoria.length
                    }{" "}
                    {articulosCategoria.length ===
                    1
                      ? "artículo disponible"
                      : "artículos disponibles"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCategoriaSeleccionada(
                      null,
                    )
                  }
                >
                  Ver todas
                </button>
              </header>

              {articulosCategoria.length ===
              0 ? (
                <p className="status-message">
                  No hay artículos
                  disponibles en esta
                  categoría.
                </p>
              ) : (
                <section
                  className="products-grid"
                  aria-label={`Artículos de ${categoriaSeleccionada}`}
                >
                  {articulosCategoria.map(
                    (articulo) => {
                      const articuloId =
                        Number(
                          articulo.articulo_id,
                        );

                      return (
                        <ProductCard
                          key={
                            articuloId
                          }
                          articulo={
                            articulo
                          }
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
              )}
            </section>
          ) : (
            <div className="categories-page__instruction">
              <PackageSearch
                size={28}
              />

              <p>
                Selecciona una categoría
                para ver sus artículos.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Categories;