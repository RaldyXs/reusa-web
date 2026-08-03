import {
  ArrowLeft,
  ImagePlus,
  MapPin,
  Save,
  Upload,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  actualizarArticulo,
  eliminarImagenArticulo,
  obtenerArticuloPorId,
  subirImagenesArticulo,
} from "../services/articuloService";

interface FormularioArticulo {
  titulo: string;
  descripcion: string;
  precio: string;
  condicion: "nuevo" | "usado" | "reparado";
  ubicacion: string;
  categoriaId: string;
}

interface VistaPrevia {
  archivo: File;
  url: string;
}

interface Categoria {
  categoria_id: number;
  nombre: string;
}

interface RespuestaCategorias {
  ok: boolean;
  categorias?: Categoria[];
  message?: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (
    import.meta.env.PROD
      ? "https://reusa-backend.onrender.com/api"
      : "http://localhost:3000/api"
  );

const API_URL =
  `${API_BASE_URL}/admin`;

const formularioInicial: FormularioArticulo = {
  titulo: "",
  descripcion: "",
  precio: "",
  condicion: "usado",
  ubicacion: "",
  categoriaId: "",
};

function EditPublication() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formulario, setFormulario] =
    useState<FormularioArticulo>(
      formularioInicial,
    );

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [
    cargandoCategorias,
    setCargandoCategorias,
  ] = useState(true);

  const [imagenesActuales, setImagenesActuales] =
    useState<string[]>([]);

  const [imagenesNuevas, setImagenesNuevas] =
    useState<VistaPrevia[]>([]);

  const [cargando, setCargando] = useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [
    imagenEliminando,
    setImagenEliminando,
  ] = useState<string | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarCategorias(): Promise<void> {
      try {
        setCargandoCategorias(true);

        const response = await fetch(
          `${API_URL}/categorias`,
        );

        const datos =
          (await response.json()) as RespuestaCategorias;

        if (!response.ok || !datos.ok) {
          throw new Error(
            datos.message ??
              "No se pudieron cargar las categorías",
          );
        }

        if (componenteActivo) {
          setCategorias(
            Array.isArray(datos.categorias)
              ? datos.categorias
              : [],
          );
        }
      } catch (errorDesconocido) {
        if (componenteActivo) {
          setError(
            errorDesconocido instanceof Error
              ? errorDesconocido.message
              : "No se pudieron cargar las categorías",
          );
        }
      } finally {
        if (componenteActivo) {
          setCargandoCategorias(false);
        }
      }
    }

    void cargarCategorias();

    return () => {
      componenteActivo = false;
    };
  }, []);

  useEffect(() => {
    let componenteActivo = true;

    async function cargarArticulo(): Promise<void> {
      try {
        setCargando(true);
        setError("");

        const articuloId = Number(id);

        if (
          !Number.isInteger(articuloId) ||
          articuloId < 1
        ) {
          throw new Error(
            "El identificador del artículo no es válido",
          );
        }

        const articulo =
          await obtenerArticuloPorId(articuloId);

        if (!componenteActivo) {
          return;
        }

        setFormulario({
          titulo: articulo.titulo,
          descripcion:
            articulo.descripcion ?? "",
          precio: String(articulo.precio),
          condicion: articulo.condicion,
          ubicacion:
            articulo.ubicacion ?? "",
          categoriaId: String(
            articulo.categoria_id ?? "",
          ),
        });

        const imagenesRecibidas =
          articulo.imagenes &&
          articulo.imagenes.length > 0
            ? articulo.imagenes
            : articulo.imagen_principal
              ? [articulo.imagen_principal]
              : [];

        setImagenesActuales(
          imagenesRecibidas,
        );
      } catch (errorDesconocido) {
        if (!componenteActivo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el artículo",
        );
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    void cargarArticulo();

    return () => {
      componenteActivo = false;
    };
  }, [id]);

  function manejarImagenes(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const archivos = Array.from(
      event.target.files ?? [],
    );

    const cantidadTotal =
      imagenesActuales.length +
      imagenesNuevas.length;

    const disponibles = Math.max(
      0,
      5 - cantidadTotal,
    );

    const nuevasImagenes = archivos
      .slice(0, disponibles)
      .map((archivo) => ({
        archivo,
        url: URL.createObjectURL(archivo),
      }));

    setImagenesNuevas((actuales) => [
      ...actuales,
      ...nuevasImagenes,
    ]);

    event.target.value = "";
  }

  function eliminarImagenNueva(
    indice: number,
  ): void {
    setImagenesNuevas((actuales) => {
      const imagenEliminada =
        actuales[indice];

      if (imagenEliminada) {
        URL.revokeObjectURL(
          imagenEliminada.url,
        );
      }

      return actuales.filter(
        (_imagen, posicion) =>
          posicion !== indice,
      );
    });
  }

  async function eliminarImagenGuardada(
    urlImagen: string,
  ): Promise<void> {
    const articuloId = Number(id);

    if (
      !Number.isInteger(articuloId) ||
      articuloId < 1
    ) {
      setError(
        "El identificador del artículo no es válido.",
      );

      return;
    }

    const confirmado = window.confirm(
      "¿Deseas eliminar esta imagen de la publicación?",
    );

    if (!confirmado) {
      return;
    }

    try {
      setError("");
      setImagenEliminando(urlImagen);

      const articuloActualizado =
        await eliminarImagenArticulo(
          articuloId,
          urlImagen,
        );

      const imagenesRecibidas =
        articuloActualizado.imagenes &&
        articuloActualizado.imagenes.length >
          0
          ? articuloActualizado.imagenes
          : articuloActualizado
                .imagen_principal
            ? [
                articuloActualizado
                  .imagen_principal,
              ]
            : [];

      setImagenesActuales(
        imagenesRecibidas,
      );
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo eliminar la imagen",
      );
    } finally {
      setImagenEliminando(null);
    }
  }

  function manejarCambio(
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>,
  ): void {
    const { name, value } = event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  async function manejarEnvio(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");

    const articuloId = Number(id);
    const precio = Number(
      formulario.precio,
    );
    const categoriaId = Number(
      formulario.categoriaId,
    );

    if (
      !Number.isInteger(articuloId) ||
      articuloId < 1
    ) {
      setError(
        "El identificador del artículo no es válido.",
      );

      return;
    }

    if (
      formulario.titulo.trim().length < 3
    ) {
      setError(
        "El título debe tener al menos 3 caracteres.",
      );

      return;
    }

    if (
      formulario.descripcion.trim().length <
      10
    ) {
      setError(
        "La descripción debe tener al menos 10 caracteres.",
      );

      return;
    }

    if (
      !Number.isInteger(categoriaId) ||
      categoriaId < 1
    ) {
      setError(
        "Debes seleccionar una categoría.",
      );

      return;
    }

    if (
      !Number.isFinite(precio) ||
      precio <= 0
    ) {
      setError(
        "El precio debe ser mayor que cero.",
      );

      return;
    }

    if (!formulario.ubicacion.trim()) {
      setError(
        "La ubicación es obligatoria.",
      );

      return;
    }

    try {
      setGuardando(true);

      let articuloActualizado =
        await actualizarArticulo(
          articuloId,
          {
            titulo:
              formulario.titulo.trim(),
            descripcion:
              formulario.descripcion.trim(),
            precio,
            condicion:
              formulario.condicion,
            ubicacion:
              formulario.ubicacion.trim(),
            categoriaId,
          },
        );

      if (imagenesNuevas.length > 0) {
        articuloActualizado =
          await subirImagenesArticulo(
            articuloId,
            imagenesNuevas.map(
              (imagen) => imagen.archivo,
            ),
          );
      }

      imagenesNuevas.forEach(
        (imagen) => {
          URL.revokeObjectURL(
            imagen.url,
          );
        },
      );

      navigate(
        `/producto/${articuloActualizado.articulo_id}`,
      );
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar el artículo",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setGuardando(false);
    }
  }

  const cantidadImagenes =
    imagenesActuales.length +
    imagenesNuevas.length;

  if (cargando) {
    return (
      <p className="status-message">
        Cargando publicación...
      </p>
    );
  }

  return (
    <section className="publish-page">
      <header className="publish-page__header">
        <span>Mis publicaciones</span>

        <h1>Editar publicación</h1>

        <p>
          Modifica la información y las imágenes
          de tu artículo.
        </p>
      </header>

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      <form
        className="publish-layout"
        onSubmit={manejarEnvio}
        noValidate
      >
        <div className="publish-layout__main">
          <section className="form-card">
            <div className="form-card__title">
              <ImagePlus size={20} />

              <div>
                <h2>Imágenes del producto</h2>

                <p>
                  Tienes {cantidadImagenes} de 5
                  imágenes.
                </p>
              </div>
            </div>

            <label className="image-upload">
              <Upload size={28} />

              <strong>
                Haz clic para seleccionar imágenes
              </strong>

              <span>
                JPG, PNG o WEBP. Máximo 5 imágenes.
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={manejarImagenes}
                disabled={cantidadImagenes >= 5}
              />
            </label>

            {(imagenesActuales.length > 0 ||
              imagenesNuevas.length >
                0) && (
              <div className="image-preview-grid">
                {imagenesActuales.map(
                  (imagen, indice) => (
                    <div
                      className="image-preview"
                      key={`actual-${imagen}-${indice}`}
                    >
                      <img
                        src={imagen}
                        alt={`Imagen guardada ${indice + 1}`}
                      />

                      <span className="image-preview__cover">
                        {indice === 0
                          ? "Portada"
                          : "Guardada"}
                      </span>

                      <button
                        type="button"
                        disabled={
                          imagenEliminando ===
                          imagen
                        }
                        onClick={() =>
                          void eliminarImagenGuardada(
                            imagen,
                          )
                        }
                        aria-label="Eliminar imagen guardada"
                      >
                        {imagenEliminando ===
                        imagen
                          ? "..."
                          : "×"}
                      </button>
                    </div>
                  ),
                )}

                {imagenesNuevas.map(
                  (imagen, indice) => (
                    <div
                      className="image-preview"
                      key={`${imagen.archivo.name}-${indice}`}
                    >
                      <img
                        src={imagen.url}
                        alt={`Nueva imagen ${indice + 1}`}
                      />

                      <span className="image-preview__cover">
                        Nueva
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          eliminarImagenNueva(
                            indice,
                          )
                        }
                        aria-label="Eliminar imagen nueva"
                      >
                        ×
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          <section className="form-card">
            <div className="form-card__title">
              <div>
                <h2>Detalles generales</h2>

                <p>
                  Actualiza los datos principales
                  del artículo.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <label className="form-field form-field--full">
                <span>Título del artículo</span>

                <input
                  type="text"
                  name="titulo"
                  value={formulario.titulo}
                  onChange={manejarCambio}
                />
              </label>

              <label className="form-field">
                <span>Categoría</span>

                <select
                  name="categoriaId"
                  value={
                    formulario.categoriaId
                  }
                  onChange={manejarCambio}
                  disabled={
                    cargandoCategorias ||
                    categorias.length === 0
                  }
                >
                  <option value="">
                    {cargandoCategorias
                      ? "Cargando categorías..."
                      : categorias.length === 0
                        ? "No hay categorías disponibles"
                        : "Selecciona una categoría"}
                  </option>

                  {categorias.map(
                    (categoria) => (
                      <option
                        key={
                          categoria.categoria_id
                        }
                        value={
                          categoria.categoria_id
                        }
                      >
                        {categoria.nombre}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="form-field">
                <span>Condición</span>

                <select
                  name="condicion"
                  value={formulario.condicion}
                  onChange={manejarCambio}
                >
                  <option value="nuevo">
                    Nuevo
                  </option>

                  <option value="usado">
                    Usado
                  </option>

                  <option value="reparado">
                    Reparado
                  </option>
                </select>
              </label>

              <label className="form-field form-field--full">
                <span>Descripción</span>

                <textarea
                  name="descripcion"
                  rows={6}
                  value={
                    formulario.descripcion
                  }
                  onChange={manejarCambio}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="publish-layout__aside">
          <section className="form-card">
            <h2>Precio</h2>

            <label className="form-field">
              <span>
                Precio en pesos dominicanos
              </span>

              <div className="price-input">
                <span>RD$</span>

                <input
                  type="number"
                  name="precio"
                  min="1"
                  step="0.01"
                  value={formulario.precio}
                  onChange={manejarCambio}
                />
              </div>
            </label>
          </section>

          <section className="form-card">
            <h2>Ubicación</h2>

            <label className="form-field">
              <span>Ubicación</span>

              <div className="input-with-icon">
                <MapPin size={17} />

                <input
                  type="text"
                  name="ubicacion"
                  value={
                    formulario.ubicacion
                  }
                  onChange={manejarCambio}
                />
              </div>
            </label>
          </section>

          <button
            className="publish-submit"
            type="submit"
            disabled={
              guardando ||
              cargandoCategorias ||
              categorias.length === 0
            }
          >
            <Save size={17} />

            {guardando
              ? "Guardando..."
              : "Guardar cambios"}
          </button>

          <button
            className="publish-preview-button"
            type="button"
            onClick={() =>
              navigate(
                "/mis-publicaciones",
              )
            }
          >
            <ArrowLeft size={17} />
            Volver
          </button>
        </aside>
      </form>
    </section>
  );
}

export default EditPublication;