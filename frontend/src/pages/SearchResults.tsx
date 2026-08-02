import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useSearchParams,
} from "react-router-dom";

import ProductCard from "../components/ProductCard";
import type {
  Articulo,
} from "../interfaces/articulo";

import {
  buscarArticulos,
  obtenerArticulos,
} from "../services/articuloService";

import {
  obtenerIdsFavoritos,
} from "../services/favoritoService";

type CondicionFiltro =
  | "nuevo"
  | "reparado"
  | "usado";

function SearchResults() {
  const [searchParams] =
    useSearchParams();

  const termino =
    searchParams
      .get("busqueda")
      ?.trim() ?? "";

  const categoriaUrl =
    searchParams
      .get("categoria")
      ?.trim() ?? "";

  const [
    articulos,
    setArticulos,
  ] = useState<Articulo[]>([]);

  const [
    idsFavoritos,
    setIdsFavoritos,
  ] = useState<number[]>([]);

  const [
    categoriasSeleccionadas,
    setCategoriasSeleccionadas,
  ] = useState<string[]>(() =>
    categoriaUrl
      ? [categoriaUrl]
      : [],
  );

  const [
    condicionesSeleccionadas,
    setCondicionesSeleccionadas,
  ] = useState<CondicionFiltro[]>([]);

  const [
    precioMinimo,
    setPrecioMinimo,
  ] = useState("");

  const [
    precioMaximo,
    setPrecioMaximo,
  ] = useState("");

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

    async function cargarResultados(): Promise<void> {
      try {
        setCargando(true);
        setError("");

        const datos = termino
          ? await buscarArticulos(
              termino,
            )
          : await obtenerArticulos();

        const disponibles =
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
          disponibles,
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

    void cargarResultados();

    return () => {
      componenteActivo = false;
    };
  }, [termino]);

  useEffect(() => {
    const temporizador =
      window.setTimeout(() => {
        setCategoriasSeleccionadas(
          categoriaUrl
            ? [categoriaUrl]
            : [],
        );
      }, 0);

    return () => {
      window.clearTimeout(
        temporizador,
      );
    };
  }, [categoriaUrl]);

  const categoriasDisponibles =
    useMemo(() => {
      const nombres =
        articulos
          .map((articulo) =>
            articulo.categoria?.trim(),
          )
          .filter(
            (
              categoria,
            ): categoria is string =>
              Boolean(categoria),
          );

      return Array.from(
        new Set(nombres),
      ).sort(
        (
          categoriaA,
          categoriaB,
        ) =>
          categoriaA.localeCompare(
            categoriaB,
            "es",
          ),
      );
    }, [articulos]);

  const articulosFiltrados =
    useMemo(() => {
      const minimo =
        precioMinimo.trim() === ""
          ? null
          : Number(precioMinimo);

      const maximo =
        precioMaximo.trim() === ""
          ? null
          : Number(precioMaximo);

      return articulos.filter(
        (articulo) => {
          const precio =
            Number(
              articulo.precio,
            );

          const coincideCategoria =
            categoriasSeleccionadas.length ===
              0 ||
            categoriasSeleccionadas.some(
              (categoria) =>
                categoria.toLowerCase() ===
                articulo.categoria
                  ?.trim()
                  .toLowerCase(),
            );

          const coincideCondicion =
            condicionesSeleccionadas.length ===
              0 ||
            condicionesSeleccionadas.includes(
              articulo.condicion as CondicionFiltro,
            );

          const coincideMinimo =
            minimo === null ||
            (
              Number.isFinite(
                minimo,
              ) &&
              precio >= minimo
            );

          const coincideMaximo =
            maximo === null ||
            (
              Number.isFinite(
                maximo,
              ) &&
              precio <= maximo
            );

          return (
            coincideCategoria &&
            coincideCondicion &&
            coincideMinimo &&
            coincideMaximo
          );
        },
      );
    }, [
      articulos,
      categoriasSeleccionadas,
      condicionesSeleccionadas,
      precioMinimo,
      precioMaximo,
    ]);

  const filtrosActivos =
    categoriasSeleccionadas.length >
      0 ||
    condicionesSeleccionadas.length >
      0 ||
    precioMinimo.trim() !== "" ||
    precioMaximo.trim() !== "";

  const titulo = termino
    ? `Resultados para “${termino}”`
    : categoriaUrl
      ? categoriaUrl
      : "Marketplace";

  function alternarCategoria(
    categoria: string,
  ): void {
    setCategoriasSeleccionadas(
      (categoriasActuales) =>
        categoriasActuales.includes(
          categoria,
        )
          ? categoriasActuales.filter(
              (categoriaActual) =>
                categoriaActual !==
                categoria,
            )
          : [
              ...categoriasActuales,
              categoria,
            ],
    );
  }

  function alternarCondicion(
    condicion: CondicionFiltro,
  ): void {
    setCondicionesSeleccionadas(
      (condicionesActuales) =>
        condicionesActuales.includes(
          condicion,
        )
          ? condicionesActuales.filter(
              (condicionActual) =>
                condicionActual !==
                condicion,
            )
          : [
              ...condicionesActuales,
              condicion,
            ],
    );
  }

  function limpiarFiltros(): void {
    setCategoriasSeleccionadas(
      [],
    );

    setCondicionesSeleccionadas(
      [],
    );

    setPrecioMinimo("");
    setPrecioMaximo("");
  }

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
    <section className="search-results-page">
      <aside className="search-filters">
        <div className="search-filters__header">
          <h2>Filtros</h2>

          <button
            type="button"
            disabled={
              !filtrosActivos
            }
            onClick={
              limpiarFiltros
            }
          >
            Limpiar
          </button>
        </div>

        <div className="search-filter-group">
          <h3>Categoría</h3>

          {categoriasDisponibles.length ===
          0 ? (
            <p>
              No hay categorías
              disponibles.
            </p>
          ) : (
            categoriasDisponibles.map(
              (categoria) => (
                <label
                  key={categoria}
                >
                  <input
                    type="checkbox"
                    checked={categoriasSeleccionadas.includes(
                      categoria,
                    )}
                    onChange={() =>
                      alternarCategoria(
                        categoria,
                      )
                    }
                  />

                  {categoria}
                </label>
              ),
            )
          )}
        </div>

        <div className="search-filter-group">
          <h3>
            Rango de precio
          </h3>

          <div className="search-price-range">
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Mínimo"
              value={
                precioMinimo
              }
              onChange={(evento) =>
                setPrecioMinimo(
                  evento.target.value,
                )
              }
            />

            <input
              type="number"
              min="0"
              step="1"
              placeholder="Máximo"
              value={
                precioMaximo
              }
              onChange={(evento) =>
                setPrecioMaximo(
                  evento.target.value,
                )
              }
            />
          </div>
        </div>

        <div className="search-filter-group">
          <h3>Condición</h3>

          <div className="search-condition-buttons">
            <button
              type="button"
              className={
                condicionesSeleccionadas.includes(
                  "nuevo",
                )
                  ? "search-condition-button search-condition-button--active"
                  : "search-condition-button"
              }
              onClick={() =>
                alternarCondicion(
                  "nuevo",
                )
              }
            >
              Nuevo
            </button>

            <button
              type="button"
              className={
                condicionesSeleccionadas.includes(
                  "reparado",
                )
                  ? "search-condition-button search-condition-button--active"
                  : "search-condition-button"
              }
              onClick={() =>
                alternarCondicion(
                  "reparado",
                )
              }
            >
              Reparado
            </button>

            <button
              type="button"
              className={
                condicionesSeleccionadas.includes(
                  "usado",
                )
                  ? "search-condition-button search-condition-button--active"
                  : "search-condition-button"
              }
              onClick={() =>
                alternarCondicion(
                  "usado",
                )
              }
            >
              Usado
            </button>
          </div>
        </div>
      </aside>

      <div className="search-results-page__content">
        <header className="search-results-header">
          <div>
            <span>
              Marketplace
            </span>

            <h1>{titulo}</h1>

            <p>
              {cargando
                ? "Buscando publicaciones..."
                : `${articulosFiltrados.length} ${
                    articulosFiltrados.length ===
                    1
                      ? "publicación encontrada"
                      : "publicaciones encontradas"
                  }`}
            </p>
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
            Cargando resultados...
          </p>
        ) : articulosFiltrados.length ===
          0 ? (
          <div className="status-message">
            <p>
              No se encontraron artículos
              con los filtros
              seleccionados.
            </p>

            {filtrosActivos && (
              <button
                type="button"
                onClick={
                  limpiarFiltros
                }
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <section
            className="products-grid"
            aria-label="Resultados del Marketplace"
          >
            {articulosFiltrados.map(
              (articulo) => {
                const articuloId =
                  Number(
                    articulo.articulo_id,
                  );

                return (
                  <ProductCard
                    key={articuloId}
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
      </div>
    </section>
  );
}

export default SearchResults;