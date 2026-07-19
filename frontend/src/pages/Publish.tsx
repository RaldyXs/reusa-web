import { ImagePlus, MapPin, Upload } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";

interface VistaPrevia {
  archivo: File;
  url: string;
}

function Publish() {
  const [imagenes, setImagenes] = useState<VistaPrevia[]>([]);

  function manejarImagenes(event: ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(event.target.files ?? []);
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
  }

  function eliminarImagen(indice: number) {
    setImagenes((actuales) => {
      URL.revokeObjectURL(actuales[indice].url);

      return actuales.filter(
        (_imagen, posicion) => posicion !== indice,
      );
    });
  }

  function manejarEnvio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("Formulario preparado", {
      cantidadImagenes: imagenes.length,
    });
  }

  return (
    <section className="publish-page">
      <header className="publish-page__header">
        <span>Marketplace</span>
        <h1>Publicar artículo</h1>
        <p>
          Completa los detalles para publicar tu producto en
          Re-Usa Web.
        </p>
      </header>

      <form
        className="publish-layout"
        onSubmit={manejarEnvio}
      >
        <div className="publish-layout__main">
          <section className="form-card">
            <div className="form-card__title">
              <ImagePlus size={20} />

              <div>
                <h2>Imágenes del producto</h2>
                <p>
                  Sube hasta cinco imágenes. La primera será la
                  portada.
                </p>
              </div>
            </div>

            <label className="image-upload">
              <Upload size={28} />

              <strong>
                Haz clic para seleccionar imágenes
              </strong>

              <span>JPG, PNG o WEBP. Máximo 5 imágenes.</span>

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
                {imagenes.map((imagen, indice) => (
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
                      onClick={() => eliminarImagen(indice)}
                      aria-label="Eliminar imagen"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="form-card">
            <div className="form-card__title">
              <div>
                <h2>Detalles generales</h2>
                <p>Describe correctamente el artículo.</p>
              </div>
            </div>

            <div className="form-grid">
              <label className="form-field form-field--full">
                <span>Título del artículo</span>
                <input
                  type="text"
                  name="titulo"
                  placeholder="Ej. Laptop Dell Inspiron"
                  required
                />
              </label>

              <label className="form-field">
                <span>Categoría</span>

                <select name="categoria" required>
                  <option value="">
                    Selecciona una categoría
                  </option>
                  <option value="1">Electrónica</option>
                  <option value="2">Hogar</option>
                  <option value="3">Vehículos</option>
                  <option value="4">Ropa</option>
                </select>
              </label>

              <label className="form-field">
                <span>Condición</span>

                <select name="condicion" required>
                  <option value="nuevo">Nuevo</option>
                  <option value="usado">Usado</option>
                  <option value="reparado">Reparado</option>
                </select>
              </label>

              <label className="form-field form-field--full">
                <span>Descripción</span>

                <textarea
                  name="descripcion"
                  rows={6}
                  placeholder="Describe las características y el estado del artículo..."
                  required
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="publish-layout__aside">
          <section className="form-card">
            <h2>Precio</h2>

            <label className="form-field">
              <span>Precio en pesos dominicanos</span>

              <div className="price-input">
                <span>RD$</span>

                <input
                  type="number"
                  name="precio"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </label>
          </section>

          <section className="form-card">
            <h2>Ubicación y contacto</h2>

            <label className="form-field">
              <span>Ubicación</span>

              <div className="input-with-icon">
                <MapPin size={17} />

                <input
                  type="text"
                  name="ubicacion"
                  placeholder="Los Alcarrizos"
                  required
                />
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

          <button className="publish-submit" type="submit">
            Publicar artículo
          </button>

          <button
            className="publish-preview-button"
            type="button"
          >
            Vista previa
          </button>
        </aside>
      </form>
    </section>
  );
}

export default Publish;