import {
  ImagePlus,
  MapPin,
  Upload,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  crearArticulo,
  subirImagenesArticulo,
} from "../services/articuloService";

import {
  PROVINCIAS_REPUBLICA_DOMINICANA,
} from "../data/provincias";

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

function Publish() {
  const navigate = useNavigate();

  const [imagenes, setImagenes] =
    useState<VistaPrevia[]>([]);

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [
    cargandoCategorias,
    setCargandoCategorias,
  ] = useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

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

  function manejarImagenes(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const archivos = Array.from(
      event.target.files ?? [],
    );

    const disponibles = 5 - imagenes.length;

    const nuevasImagenes = archivos
      .slice(0, disponibles)
      .map((archivo) => ({
        archivo,
        url: URL.createObjectURL(archivo),
      }));

    setImagenes((actuales) => [
      ...actuales,
      ...nuevasImagenes,
    ]);

    event.target.value = "";
  }

  function eliminarImagen(indice: number): void {
    setImagenes((actuales) => {
      const imagenEliminada = actuales[indice];

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

  async function manejarEnvio(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const datosFormulario = new FormData(
      event.currentTarget,
    );

    const titulo = String(
      datosFormulario.get("titulo") ?? "",
    ).trim();

    const descripcion = String(
      datosFormulario.get("descripcion") ?? "",
    ).trim();

    const categoriaId = Number(
      datosFormulario.get("categoria"),
    );

    const condicion = String(
      datosFormulario.get("condicion") ?? "",
    ) as "nuevo" | "usado" | "reparado";

    const precio = Number(
      datosFormulario.get("precio"),
    );

    const ubicacion = String(
      datosFormulario.get("ubicacion") ?? "",
    ).trim();

    setError("");
    setMensaje("");

    if (titulo.length < 3) {
      setError(
        "El título debe tener al menos 3 caracteres.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (
      !Number.isInteger(categoriaId) ||
      categoriaId < 1
    ) {
      setError(
        "Debes seleccionar una categoría.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (
      condicion !== "nuevo" &&
      condicion !== "usado" &&
      condicion !== "reparado"
    ) {
      setError(
        "Debes seleccionar una condición válida.",
      );

      return;
    }

    if (descripcion.length < 10) {
      setError(
        "La descripción debe tener al menos 10 caracteres.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (
      !Number.isFinite(precio) ||
      precio <= 0
    ) {
      setError(
        "El precio debe ser mayor que cero.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (!ubicacion) {
      setError(
        "Debes seleccionar una provincia.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setGuardando(true);

      const articuloCreado =
        await crearArticulo({
          titulo,
          descripcion,
          precio,
          condicion,
          ubicacion,
          categoriaId,
        });

      let articuloFinal = articuloCreado;

      if (imagenes.length > 0) {
        articuloFinal =
          await subirImagenesArticulo(
            articuloCreado.articulo_id,
            imagenes.map(
              (imagen) => imagen.archivo,
            ),
          );
      }

      setMensaje(
        "Artículo publicado correctamente.",
      );

      imagenes.forEach((imagen) => {
        URL.revokeObjectURL(imagen.url);
      });

      navigate(
        `/producto/${articuloFinal.articulo_id}`,
      );
    } catch (errorDesconocido) {
      const mensajeError =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "Ocurrió un error inesperado";

      setError(mensajeError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="publish-page">
      <header className="publish-page__header">
        <span>Marketplace</span>

        <h1>Publicar artículo</h1>

        <p>
          Completa los detalles para publicar tu
          producto en Re-Usa Web.
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

      {mensaje && (
        <div
          className="publish-success"
          role="status"
        >
          {mensaje}
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
                  Sube hasta cinco imágenes. La
                  primera será la portada.
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
                disabled={imagenes.length >= 5}
              />
            </label>

            {imagenes.length > 0 && (
              <div className="image-preview-grid">
                {imagenes.map(
                  (imagen, indice) => (
                    <div
                      className="image-preview"
                      key={`${imagen.archivo.name}-${indice}`}
                    >
                      <img
                        src={imagen.url}
                        alt={`Vista previa ${indice + 1}`}
                      />

                      {indice === 0 && (
                        <span className="image-preview__cover">
                          Portada
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          eliminarImagen(indice)
                        }
                        aria-label="Eliminar imagen"
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
                  Describe correctamente el artículo.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <label className="form-field form-field--full">
                <span>Título del artículo</span>

                <input
                  type="text"
                  name="titulo"
                  placeholder="Ej. Laptop Dell Inspiron"
                />
              </label>

              <label className="form-field">
                <span>Categoría</span>

                <select
                  name="categoria"
                  defaultValue=""
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

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.categoria_id}
                      value={categoria.categoria_id}
                    >
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Condición</span>

                <select
                  name="condicion"
                  defaultValue="usado"
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
                  placeholder="Describe las características y el estado del artículo..."
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
                  placeholder="0.00"
                />
              </div>
            </label>
          </section>

          <section className="form-card">
            <h2>Ubicación y contacto</h2>

            <label className="form-field">
              <span>Provincia</span>

              <div className="input-with-icon">
                <MapPin size={17} />

                <select
                  name="ubicacion"
                  defaultValue=""
                >
                  <option value="">
                    Selecciona una provincia
                  </option>

                  {PROVINCIAS_REPUBLICA_DOMINICANA.map(
                    (provincia) => (
                      <option
                        key={provincia}
                        value={provincia}
                      >
                        {provincia}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </label>

            <label className="form-field">
              <span>Número de contacto</span>

              <input
                type="tel"
                name="telefono"
                placeholder="809-000-0000"
              />
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
            {guardando
              ? "Publicando..."
              : "Publicar artículo"}
          </button>
        </aside>
      </form>
    </section>
  );
}

export default Publish;