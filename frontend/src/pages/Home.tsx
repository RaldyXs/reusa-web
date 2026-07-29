import {
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import FeaturedPanel from "../components/FeaturedPanel";
import ProductCard from "../components/ProductCard";
import type { Articulo } from "../interfaces/articulo";
import { obtenerArticulos } from "../services/articuloService";
import { obtenerIdsFavoritos } from "../services/favoritoService";

type CondicionFiltro =
  | "todas"
  | "nuevo"
  | "reparado"
  | "usado";

function Home() {
  const [articulos, setArticulos] =
    useState<Articulo[]>([]);

  const [idsFavoritos, setIdsFavoritos] =
    useState<number[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    mostrarFiltros,
    setMostrarFiltros,
  ] = useState(false);

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState("todas");

  const [
    condicionSeleccionada,
    setCondicionSeleccionada,
  ] = useState<CondicionFiltro>(
    "todas",
  );

  const [precioMinimo, setPrecioMinimo] =
    useState("");

  const [precioMaximo, setPrecioMaximo] =
    useState("");

  const [ubicacion, setUbicacion] =
    useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarArticulos() {
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

  const categorias = useMemo(() => {
    const nombres = articulos
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
    ).sort((categoriaA, categoriaB) =>
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

      const ubicacionBuscada =
        ubicacion
          .trim()
          .toLowerCase();

      return articulos.filter(
        (articulo) => {
          const precio = Number(
            articulo.precio,
          );

          const coincideCategoria =
            categoriaSeleccionada ===
              "todas" ||
            articulo.categoria ===
              categoriaSeleccionada;

          const coincideCondicion =
            condicionSeleccionada ===
              "todas" ||
            articulo.condicion ===
              condicionSeleccionada;

          const coincidePrecioMinimo =
            minimo === null ||
            (!Number.isNaN(minimo) &&
              precio >= minimo);

          const coincidePrecioMaximo =
            maximo === null ||
            (!Number.isNaN(maximo) &&
              precio <= maximo);

          const coincideUbicacion =
            ubicacionBuscada === "" ||
            articulo.ubicacion
              ?.toLowerCase()
              .includes(
                ubicacionBuscada,
              );

          return (
            coincideCategoria &&
            coincideCondicion &&
            coincidePrecioMinimo &&
            coincidePrecioMaximo &&
            coincideUbicacion
          );
        },
      );
    }, [
      articulos,
      categoriaSeleccionada,
      condicionSeleccionada,
      precioMinimo,
      precioMaximo,
      ubicacion,
    ]);

  const filtrosActivos =
    categoriaSeleccionada !==
      "todas" ||
    condicionSeleccionada !==
      "todas" ||
    precioMinimo.trim() !== "" ||
    precioMaximo.trim() !== "" ||
    ubicacion.trim() !== "";

  function limpiarFiltros(): void {
    setCategoriaSeleccionada(
      "todas",
    );

    setCondicionSeleccionada(
      "todas",
    );

    setPrecioMinimo("");
    setPrecioMaximo("");
    setUbicacion("");
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
            aria-expanded={
              mostrarFiltros
            }
            onClick={() =>
              setMostrarFiltros(
                (estadoActual) =>
                  !estadoActual,
              )
            }
          >
            {mostrarFiltros ? (
              <X size={17} />
            ) : (
              <SlidersHorizontal
                size={17}
              />
            )}

            <span>
              {mostrarFiltros
                ? "Cerrar filtros"
                : "Filtros"}
            </span>
          </button>
        </header>

        {mostrarFiltros && (
          <section className="marketplace-filters">
            <label>
              Categoría

              <select
                value={
                  categoriaSeleccionada
                }
                onChange={(evento) =>
                  setCategoriaSeleccionada(
                    evento.target.value,
                  )
                }
              >
                <option value="todas">
                  Todas las categorías
                </option>

                {categorias.map(
                  (categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Condición

              <select
                value={
                  condicionSeleccionada
                }
                onChange={(evento) =>
                  setCondicionSeleccionada(
                    evento.target
                      .value as CondicionFiltro,
                  )
                }
              >
                <option value="todas">
                  Todas
                </option>

                <option value="nuevo">
                  Nuevo
                </option>

                <option value="reparado">
                  Reparado
                </option>

                <option value="usado">
                  Usado
                </option>
              </select>
            </label>

            <label>
              Precio mínimo

              <input
                type="number"
                min="0"
                step="1"
                value={precioMinimo}
                placeholder="RD$ 0"
                onChange={(evento) =>
                  setPrecioMinimo(
                    evento.target.value,
                  )
                }
              />
            </label>

            <label>
              Precio máximo

              <input
                type="number"
                min="0"
                step="1"
                value={precioMaximo}
                placeholder="Sin límite"
                onChange={(evento) =>
                  setPrecioMaximo(
                    evento.target.value,
                  )
                }
              />
            </label>

            <label>
              Ubicación

              <input
                type="text"
                value={ubicacion}
                placeholder="Ej. Santo Domingo"
                onChange={(evento) =>
                  setUbicacion(
                    evento.target.value,
                  )
                }
              />
            </label>

            <button
              type="button"
              disabled={!filtrosActivos}
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </section>
        )}

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
                {articulosFiltrados.length}{" "}
                {articulosFiltrados.length ===
                1
                  ? "artículo"
                  : "artículos"}
              </span>
            </div>

            {articulosFiltrados.length ===
            0 ? (
              <div className="status-message">
                <p>
                  No encontramos artículos
                  con esos filtros.
                </p>

                <button
                  type="button"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <section
                className="products-grid"
                aria-label="Publicaciones recientes"
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
            )}
          </>
        )}
      </section>

      <FeaturedPanel />
    </div>
  );
}

export default Home;