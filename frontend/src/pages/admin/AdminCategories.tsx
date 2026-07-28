import {
  FolderCheck,
  FolderTree,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  actualizarCategoriaAdmin,
  cambiarEstadoCategoriaAdmin,
  crearCategoriaAdmin,
  obtenerCategoriasAdmin,
  type CategoriaAdministracion,
} from "../../services/adminService";

interface FormularioCategoria {
  nombre: string;
  descripcion: string;
}

const FORMULARIO_INICIAL: FormularioCategoria = {
  nombre: "",
  descripcion: "",
};

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatearFecha(fecha: string): string {
  const fechaConvertida = new Date(fecha);

  if (
    Number.isNaN(fechaConvertida.getTime())
  ) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-DO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(fechaConvertida);
}

function AdminCategories() {
  const [categorias, setCategorias] =
    useState<CategoriaAdministracion[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [actualizando, setActualizando] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [
    categoriaActualizandoId,
    setCategoriaActualizandoId,
  ] = useState<number | null>(null);

  const [
    categoriaEditando,
    setCategoriaEditando,
  ] =
    useState<CategoriaAdministracion | null>(
      null,
    );

  const [
    formularioVisible,
    setFormularioVisible,
  ] = useState(false);

  const [formulario, setFormulario] =
    useState<FormularioCategoria>(
      FORMULARIO_INICIAL,
    );

  const [error, setError] = useState("");
  const [mensaje, setMensaje] =
    useState("");

  const cargarCategorias = useCallback(
    async (
      mostrarActualizacion = false,
    ): Promise<void> => {
      try {
        setError("");
        setMensaje("");

        if (mostrarActualizacion) {
          setActualizando(true);
        } else {
          setCargando(true);
        }

        const categoriasRecibidas =
          await obtenerCategoriasAdmin();

        setCategorias(categoriasRecibidas);
      } catch (errorDesconocido) {
        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar las categorías",
        );
      } finally {
        setCargando(false);
        setActualizando(false);
      }
    },
    [],
  );

  useEffect(() => {
    const temporizador =
      window.setTimeout(() => {
        void cargarCategorias();
      }, 0);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [cargarCategorias]);

  function abrirFormularioCreacion(): void {
    setError("");
    setMensaje("");
    setCategoriaEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setFormularioVisible(true);
  }

  function abrirFormularioEdicion(
    categoria: CategoriaAdministracion,
  ): void {
    setError("");
    setMensaje("");
    setCategoriaEditando(categoria);

    setFormulario({
      nombre: categoria.nombre,
      descripcion:
        categoria.descripcion ?? "",
    });

    setFormularioVisible(true);
  }

  function cerrarFormulario(): void {
    if (guardando) {
      return;
    }

    setFormularioVisible(false);
    setCategoriaEditando(null);
    setFormulario(FORMULARIO_INICIAL);
  }

  async function manejarEnvioFormulario(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setMensaje("");

    const nombre = formulario.nombre.trim();
    const descripcion =
      formulario.descripcion.trim();

    if (nombre.length < 2) {
      setError(
        "El nombre debe tener al menos 2 caracteres.",
      );

      return;
    }

    try {
      setGuardando(true);

      if (categoriaEditando) {
        const categoriaActualizada =
          await actualizarCategoriaAdmin(
            categoriaEditando.categoria_id,
            {
              nombre,
              descripcion,
            },
          );

        setCategorias((categoriasActuales) =>
          categoriasActuales.map(
            (categoriaActual) =>
              categoriaActual.categoria_id ===
              categoriaActualizada.categoria_id
                ? categoriaActualizada
                : categoriaActual,
          ),
        );

        setMensaje(
          "Categoría actualizada correctamente.",
        );
      } else {
        const categoriaCreada =
          await crearCategoriaAdmin({
            nombre,
            descripcion,
          });

        setCategorias((categoriasActuales) =>
          [...categoriasActuales, categoriaCreada]
            .sort((categoriaA, categoriaB) => {
              if (
                categoriaA.activo !==
                categoriaB.activo
              ) {
                return (
                  categoriaB.activo -
                  categoriaA.activo
                );
              }

              return categoriaA.nombre.localeCompare(
                categoriaB.nombre,
                "es",
              );
            }),
        );

        setMensaje(
          "Categoría creada correctamente.",
        );
      }

      setFormularioVisible(false);
      setCategoriaEditando(null);
      setFormulario(FORMULARIO_INICIAL);
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo guardar la categoría",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function manejarCambioEstado(
    categoria: CategoriaAdministracion,
  ): Promise<void> {
    const estaActiva =
      categoria.activo === 1;

    const nuevoEstado = !estaActiva;

    const accion = nuevoEstado
      ? "activar"
      : "desactivar";

    const confirmado = window.confirm(
      `¿Seguro que deseas ${accion} la categoría "${categoria.nombre}"?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setError("");
      setMensaje("");
      setCategoriaActualizandoId(
        categoria.categoria_id,
      );

      const categoriaActualizada =
        await cambiarEstadoCategoriaAdmin(
          categoria.categoria_id,
          nuevoEstado,
        );

      setCategorias((categoriasActuales) =>
        categoriasActuales.map(
          (categoriaActual) =>
            categoriaActual.categoria_id ===
            categoriaActualizada.categoria_id
              ? categoriaActualizada
              : categoriaActual,
        ),
      );

      setMensaje(
        nuevoEstado
          ? "Categoría activada correctamente."
          : "Categoría desactivada correctamente.",
      );
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar la categoría",
      );
    } finally {
      setCategoriaActualizandoId(null);
    }
  }

  const categoriasFiltradas =
    useMemo(() => {
      const termino =
        normalizarTexto(busqueda);

      if (!termino) {
        return categorias;
      }

      return categorias.filter(
        (categoria) =>
          normalizarTexto(
            categoria.nombre,
          ).includes(termino) ||
          normalizarTexto(
            categoria.descripcion ?? "",
          ).includes(termino),
      );
    }, [busqueda, categorias]);

  const totalActivas = useMemo(
    () =>
      categorias.filter(
        (categoria) =>
          categoria.activo === 1,
      ).length,
    [categorias],
  );

  const totalInactivas = useMemo(
    () =>
      categorias.filter(
        (categoria) =>
          categoria.activo === 0,
      ).length,
    [categorias],
  );

  if (cargando) {
    return (
      <section className="admin-categories-page">
        <p className="status-message">
          Cargando categorías...
        </p>
      </section>
    );
  }

  return (
    <section className="admin-categories-page">
      <header className="admin-content-header">
        <div>
          <span>
            GESTIÓN DE CATEGORÍAS
          </span>

          <h1>
            Categorías del marketplace
          </h1>

          <p>
            Crea, edita y administra las
            categorías disponibles para las
            publicaciones.
          </p>
        </div>

        <div className="admin-content-header__actions">
          <button
            type="button"
            className="admin-refresh-button"
            disabled={actualizando}
            onClick={() =>
              void cargarCategorias(true)
            }
          >
            <RefreshCw
              size={17}
              className={
                actualizando
                  ? "admin-spin"
                  : undefined
              }
            />

            {actualizando
              ? "Actualizando..."
              : "Actualizar"}
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={abrirFormularioCreacion}
          >
            <Plus size={17} />
            Nueva categoría
          </button>
        </div>
      </header>

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      {mensaje && (
        <div
          className="success-message"
          role="status"
        >
          {mensaje}
        </div>
      )}

      {formularioVisible && (
        <section className="admin-category-form-card">
          <div className="admin-category-form-card__header">
            <div>
              <span>
                {categoriaEditando
                  ? "EDITAR CATEGORÍA"
                  : "NUEVA CATEGORÍA"}
              </span>

              <h2>
                {categoriaEditando
                  ? categoriaEditando.nombre
                  : "Crear categoría"}
              </h2>
            </div>

            <button
              type="button"
              className="admin-category-form-close"
              onClick={cerrarFormulario}
              aria-label="Cerrar formulario"
            >
              <X size={20} />
            </button>
          </div>

          <form
            className="admin-category-form"
            onSubmit={manejarEnvioFormulario}
          >
            <label>
              <span>Nombre</span>

              <input
                type="text"
                value={formulario.nombre}
                onChange={(event) =>
                  setFormulario(
                    (formularioActual) => ({
                      ...formularioActual,
                      nombre:
                        event.target.value,
                    }),
                  )
                }
                placeholder="Ejemplo: Electrodomésticos"
                maxLength={100}
                required
              />
            </label>

            <label>
              <span>Descripción</span>

              <textarea
                value={
                  formulario.descripcion
                }
                onChange={(event) =>
                  setFormulario(
                    (formularioActual) => ({
                      ...formularioActual,
                      descripcion:
                        event.target.value,
                    }),
                  )
                }
                placeholder="Describe brevemente esta categoría"
                maxLength={500}
                rows={4}
              />
            </label>

            <div className="admin-category-form__actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : categoriaEditando
                    ? "Guardar cambios"
                    : "Crear categoría"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="admin-users-summary">
        <article>
          <div>
            <FolderTree size={21} />
          </div>

          <span>Total de categorías</span>

          <strong>
            {categorias.length}
          </strong>
        </article>

        <article>
          <div>
            <FolderCheck size={21} />
          </div>

          <span>Categorías activas</span>

          <strong>{totalActivas}</strong>
        </article>

        <article>
          <div>
            <Package size={21} />
          </div>

          <span>Categorías inactivas</span>

          <strong>
            {totalInactivas}
          </strong>
        </article>
      </div>

      <section className="admin-management-card">
        <div className="admin-management-toolbar">
          <div className="admin-search-field">
            <Search size={18} />

            <input
              type="search"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(
                  event.target.value,
                )
              }
              placeholder="Buscar por nombre o descripción"
              aria-label="Buscar categorías"
            />
          </div>
        </div>

        <div className="admin-management-card__header">
          <div>
            <h2>
              Listado de categorías
            </h2>

            <p>
              Mostrando{" "}
              {categoriasFiltradas.length} de{" "}
              {categorias.length} registros.
            </p>
          </div>
        </div>

        {categoriasFiltradas.length ===
        0 ? (
          <p className="status-message">
            No se encontraron categorías.
          </p>
        ) : (
          <div className="admin-categories-grid">
            {categoriasFiltradas.map(
              (categoria) => {
                const estaActiva =
                  categoria.activo === 1;

                const procesando =
                  categoriaActualizandoId ===
                  categoria.categoria_id;

                return (
                  <article
                    key={
                      categoria.categoria_id
                    }
                    className="admin-category-card"
                  >
                    <div className="admin-category-card__icon">
                      <Package size={23} />
                    </div>

                    <div className="admin-category-card__content">
                      <div className="admin-category-card__header">
                        <div>
                          <strong>
                            {categoria.nombre}
                          </strong>

                          <small>
                            ID:{" "}
                            {
                              categoria.categoria_id
                            }
                          </small>
                        </div>

                        <span
                          className={
                            estaActiva
                              ? "admin-status admin-status--activa"
                              : "admin-status admin-status--inactiva"
                          }
                        >
                          {estaActiva
                            ? "Activa"
                            : "Inactiva"}
                        </span>
                      </div>

                      <p>
                        {categoria.descripcion ??
                          "Sin descripción registrada."}
                      </p>

                      <div className="admin-category-card__footer">
                        <span>
                          Creada:{" "}
                          {formatearFecha(
                            categoria.fecha_creacion,
                          )}
                        </span>

                        <div className="admin-category-card__actions">
                          <button
                            type="button"
                            className="admin-category-edit-button"
                            disabled={
                              categoriaActualizandoId !==
                              null
                            }
                            onClick={() =>
                              abrirFormularioEdicion(
                                categoria,
                              )
                            }
                          >
                            <Pencil size={15} />
                            Editar
                          </button>

                          <button
                            type="button"
                            className={
                              estaActiva
                                ? "admin-category-state-button admin-category-state-button--deactivate"
                                : "admin-category-state-button admin-category-state-button--activate"
                            }
                            disabled={
                              categoriaActualizandoId !==
                              null
                            }
                            onClick={() =>
                              void manejarCambioEstado(
                                categoria,
                              )
                            }
                          >
                            {procesando
                              ? "Procesando..."
                              : estaActiva
                                ? "Desactivar"
                                : "Activar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminCategories;