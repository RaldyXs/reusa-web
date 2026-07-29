import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Copy,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import type {
  Articulo,
} from "../interfaces/articulo";

import {
  obtenerArticuloPorId,
} from "../services/articuloService";

import {
  obtenerContactoVendedor,
  type ContactoVendedor,
} from "../services/contactoService";

import {
  guardarFavorito,
  obtenerIdsFavoritos,
  quitarFavorito,
} from "../services/favoritoService";

import {
  crearOferta,
} from "../services/ofertaService";

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [articulo, setArticulo] =
    useState<Articulo | null>(null);

  const [
    imagenSeleccionada,
    setImagenSeleccionada,
  ] = useState<string | null>(null);

  const [
    mostrarFormularioOferta,
    setMostrarFormularioOferta,
  ] = useState(false);

  const [precioOferta, setPrecioOferta] =
    useState("");

  const [mensajeOferta, setMensajeOferta] =
    useState("");

  const [
    enviandoOferta,
    setEnviandoOferta,
  ] = useState(false);

  const [ofertaEnviada, setOfertaEnviada] =
    useState(false);

  const [errorOferta, setErrorOferta] =
    useState("");

  const [guardado, setGuardado] =
    useState(false);

  const [
    procesandoGuardado,
    setProcesandoGuardado,
  ] = useState(false);

  const [
    errorGuardado,
    setErrorGuardado,
  ] = useState("");

  const [
    mensajeCompartido,
    setMensajeCompartido,
  ] = useState("");

  const [
    contactoVendedor,
    setContactoVendedor,
  ] = useState<ContactoVendedor | null>(
    null,
  );

  const [
    cargandoContacto,
    setCargandoContacto,
  ] = useState(false);

  const [
    errorContacto,
    setErrorContacto,
  ] = useState("");

  const [
    mensajeContacto,
    setMensajeContacto,
  ] = useState("");

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarArticulo() {
      try {
        setCargando(true);
        setError("");
        setErrorGuardado("");
        setContactoVendedor(null);
        setErrorContacto("");
        setMensajeContacto("");

        const articuloId = Number(id);

        if (
          !Number.isInteger(articuloId) ||
          articuloId < 1
        ) {
          throw new Error(
            "El identificador del artículo no es válido",
          );
        }

        const datos =
          await obtenerArticuloPorId(
            articuloId,
          );

        if (!componenteActivo) {
          return;
        }

        setArticulo(datos);

        setImagenSeleccionada(
          datos.imagenes?.[0] ??
            datos.imagen_principal ??
            null,
        );

        setPrecioOferta(
          String(
            Math.round(
              Number(datos.precio),
            ),
          ),
        );

        try {
          const idsFavoritos =
            await obtenerIdsFavoritos();

          if (componenteActivo) {
            setGuardado(
              idsFavoritos.includes(
                Number(
                  datos.articulo_id,
                ),
              ),
            );
          }
        } catch {
          if (componenteActivo) {
            setGuardado(false);
          }
        }
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "Ocurrió un error inesperado";

        if (componenteActivo) {
          setError(mensaje);
          setArticulo(null);
          setImagenSeleccionada(null);
          setGuardado(false);
        }
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

  async function manejarEnvioOferta(
    evento: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    evento.preventDefault();

    if (!articulo) {
      return;
    }

    const articuloId = Number(
      articulo.articulo_id,
    );

    const precioNumerico = Number(
      precioOferta,
    );

    if (
      !Number.isFinite(precioNumerico) ||
      precioNumerico <= 0
    ) {
      setErrorOferta(
        "Ingresa un precio válido mayor que cero",
      );

      return;
    }

    try {
      setEnviandoOferta(true);
      setErrorOferta("");

      await crearOferta(
        articuloId,
        precioNumerico,
        mensajeOferta,
      );

      setOfertaEnviada(true);
      setMostrarFormularioOferta(false);
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo enviar la oferta";

      setErrorOferta(mensaje);

      if (
        mensaje
          .toLowerCase()
          .includes("iniciar sesión") ||
        mensaje
          .toLowerCase()
          .includes("sesión")
      ) {
        navigate("/login");
      }
    } finally {
      setEnviandoOferta(false);
    }
  }

  async function alternarGuardado(): Promise<void> {
    if (
      !articulo ||
      procesandoGuardado
    ) {
      return;
    }

    const articuloId = Number(
      articulo.articulo_id,
    );

    if (
      !Number.isInteger(articuloId) ||
      articuloId <= 0
    ) {
      setErrorGuardado(
        "El artículo no es válido",
      );

      return;
    }

    try {
      setProcesandoGuardado(true);
      setErrorGuardado("");

      if (guardado) {
        await quitarFavorito(
          articuloId,
        );

        setGuardado(false);
      } else {
        await guardarFavorito(
          articuloId,
        );

        setGuardado(true);
      }
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar el artículo guardado";

      setErrorGuardado(mensaje);

      if (
        mensaje
          .toLowerCase()
          .includes("iniciar sesión") ||
        mensaje
          .toLowerCase()
          .includes("sesión")
      ) {
        navigate("/login");
      }
    } finally {
      setProcesandoGuardado(false);
    }
  }

  async function compartirProducto(): Promise<void> {
    if (!articulo) {
      return;
    }

    const url = window.location.href;

    try {
      setMensajeCompartido("");

      if (navigator.share) {
        await navigator.share({
          title: articulo.titulo,
          text: `Mira este artículo en Re-Usa: ${articulo.titulo}`,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(
        url,
      );

      setMensajeCompartido(
        "Enlace copiado al portapapeles",
      );
    } catch (errorDesconocido) {
      if (
        errorDesconocido instanceof DOMException &&
        errorDesconocido.name === "AbortError"
      ) {
        return;
      }

      setMensajeCompartido(
        "No se pudo compartir el producto",
      );
    }
  }

  async function cargarContactoVendedor(): Promise<void> {
    if (!articulo) {
      return;
    }

    try {
      setCargandoContacto(true);
      setErrorContacto("");
      setMensajeContacto("");

      const contacto =
        await obtenerContactoVendedor(
          Number(
            articulo.articulo_id,
          ),
        );

      setContactoVendedor(contacto);
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo obtener el contacto del vendedor";

      setErrorContacto(mensaje);

      if (
        mensaje
          .toLowerCase()
          .includes("iniciar sesión") ||
        mensaje
          .toLowerCase()
          .includes("sesión")
      ) {
        navigate("/login");
      }
    } finally {
      setCargandoContacto(false);
    }
  }

  async function copiarCorreo(): Promise<void> {
    if (!contactoVendedor) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        contactoVendedor.email,
      );

      setMensajeContacto(
        "Correo copiado al portapapeles",
      );
    } catch {
      setMensajeContacto(
        "No se pudo copiar el correo",
      );
    }
  }

  if (cargando) {
    return (
      <p className="status-message">
        Cargando artículo...
      </p>
    );
  }

  if (error || !articulo) {
    return (
      <section className="product-detail-error">
        <h1>
          No pudimos cargar el artículo
        </h1>

        <p>
          {error ||
            "El artículo no existe."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/marketplace")
          }
        >
          Volver al marketplace
        </button>
      </section>
    );
  }

  const precioFormateado = Number(
    articulo.precio,
  ).toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  });

  const imagenes =
    articulo.imagenes &&
    articulo.imagenes.length > 0
      ? articulo.imagenes
      : articulo.imagen_principal
        ? [articulo.imagen_principal]
        : [];

  const articuloDisponible =
    articulo.estado === "activo" &&
    Number(articulo.archivado) !== 1;

  return (
    <section className="product-detail-page">
      <button
        className="product-detail-back"
        type="button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="product-detail-layout">
        <div className="product-detail-gallery">
          <div className="product-detail-main-image">
            {imagenSeleccionada ? (
              <img
                src={imagenSeleccionada}
                alt={articulo.titulo}
              />
            ) : (
              <div className="product-detail-placeholder">
                {articulo.titulo}
              </div>
            )}

            <span className="product-detail-condition">
              {articulo.condicion}
            </span>
          </div>

          {imagenes.length > 0 && (
            <div className="product-detail-thumbnails">
              {imagenes.map(
                (imagen, indice) => (
                  <button
                    type="button"
                    key={`${imagen}-${indice}`}
                    className={
                      imagenSeleccionada ===
                      imagen
                        ? "product-detail-thumbnail product-detail-thumbnail--active"
                        : "product-detail-thumbnail"
                    }
                    onClick={() =>
                      setImagenSeleccionada(
                        imagen,
                      )
                    }
                    aria-label={`Mostrar imagen ${
                      indice + 1
                    }`}
                  >
                    <img
                      src={imagen}
                      alt={`${articulo.titulo} ${
                        indice + 1
                      }`}
                    />
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <aside className="product-detail-information">
          <span className="product-detail-category">
            {articulo.categoria}
          </span>

          <h1>{articulo.titulo}</h1>

          <strong className="product-detail-price">
            {precioFormateado}
          </strong>

          <div className="product-detail-location">
            <MapPin size={16} />

            <span>
              {articulo.ubicacion ??
                "Ubicación no indicada"}
            </span>
          </div>

          {!articuloDisponible && (
            <div
              className="error-message"
              role="status"
            >
              Este artículo ya no está
              disponible.
            </div>
          )}

          {ofertaEnviada && (
            <div
              className="success-message"
              role="status"
            >
              <CheckCircle2 size={18} />

              <span>
                Tu oferta fue enviada
                correctamente.
              </span>
            </div>
          )}

          {errorOferta && (
            <div
              className="error-message"
              role="alert"
            >
              {errorOferta}
            </div>
          )}

          {articuloDisponible &&
            !ofertaEnviada && (
              <button
                className="product-detail-contact"
                type="button"
                onClick={() => {
                  setErrorOferta("");
                  setMostrarFormularioOferta(
                    true,
                  );
                }}
              >
                <MessageSquare size={18} />
                Hacer una oferta
              </button>
            )}

          <button
            className="product-detail-contact"
            type="button"
            disabled={cargandoContacto}
            onClick={() =>
              void cargarContactoVendedor()
            }
          >
            <UserRound size={18} />

            {cargandoContacto
              ? "Consultando contacto..."
              : contactoVendedor
                ? "Actualizar contacto"
                : "Contactar al vendedor"}
          </button>

          {contactoVendedor && (
            <section className="product-detail-card">
              <div className="product-detail-offer-header">
                <div>
                  <span>
                    Datos del vendedor
                  </span>

                  <strong>
                    {
                      contactoVendedor.vendedor
                    }
                  </strong>
                </div>

                <button
                  type="button"
                  aria-label="Cerrar datos de contacto"
                  onClick={() => {
                    setContactoVendedor(
                      null,
                    );
                    setMensajeContacto("");
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="product-detail-contact-data">
                <div>
                  <Mail size={17} />

                  <a
                    href={`mailto:${contactoVendedor.email}`}
                  >
                    {
                      contactoVendedor.email
                    }
                  </a>

                  <button
                    type="button"
                    aria-label="Copiar correo"
                    onClick={() =>
                      void copiarCorreo()
                    }
                  >
                    <Copy size={16} />
                  </button>
                </div>

                <div>
                  <Phone size={17} />

                  {contactoVendedor.telefono ? (
                    <a
                      href={`tel:${contactoVendedor.telefono}`}
                    >
                      {
                        contactoVendedor.telefono
                      }
                    </a>
                  ) : (
                    <span>
                      Teléfono no indicado
                    </span>
                  )}
                </div>
              </div>

              {mensajeContacto && (
                <div
                  className="success-message"
                  role="status"
                >
                  <CheckCircle2
                    size={18}
                  />

                  <span>
                    {mensajeContacto}
                  </span>
                </div>
              )}
            </section>
          )}

          {errorContacto && (
            <div
              className="error-message"
              role="alert"
            >
              {errorContacto}
            </div>
          )}

          {mostrarFormularioOferta && (
            <form
              className="product-detail-offer-form"
              onSubmit={(evento) =>
                void manejarEnvioOferta(
                  evento,
                )
              }
            >
              <div className="product-detail-offer-header">
                <div>
                  <span>
                    Oferta por el artículo
                  </span>

                  <strong>
                    {articulo.titulo}
                  </strong>
                </div>

                <button
                  type="button"
                  aria-label="Cerrar formulario"
                  onClick={() => {
                    setMostrarFormularioOferta(
                      false,
                    );
                    setErrorOferta("");
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <label>
                Precio ofertado

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={precioOferta}
                  onChange={(evento) =>
                    setPrecioOferta(
                      evento.target.value,
                    )
                  }
                  required
                />
              </label>

              <label>
                Mensaje opcional

                <textarea
                  value={mensajeOferta}
                  onChange={(evento) =>
                    setMensajeOferta(
                      evento.target.value,
                    )
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Escribe un mensaje para el vendedor"
                />
              </label>

              <button
                type="submit"
                disabled={enviandoOferta}
              >
                {enviandoOferta
                  ? "Enviando..."
                  : "Enviar oferta"}
              </button>
            </form>
          )}

          <div className="product-detail-secondary-actions">
            <button
              type="button"
              disabled={procesandoGuardado}
              className={
                guardado
                  ? "product-detail-save product-detail-save--active"
                  : "product-detail-save"
              }
              onClick={() =>
                void alternarGuardado()
              }
            >
              <Bookmark
                size={17}
                fill={
                  guardado
                    ? "currentColor"
                    : "none"
                }
              />

              {procesandoGuardado
                ? "Procesando..."
                : guardado
                  ? "Guardado"
                  : "Guardar"}
            </button>

            <button
              type="button"
              onClick={() =>
                void compartirProducto()
              }
            >
              <Share2 size={17} />
              Compartir
            </button>
          </div>

          {errorGuardado && (
            <div
              className="error-message"
              role="alert"
            >
              {errorGuardado}
            </div>
          )}

          {mensajeCompartido && (
            <div
              className="success-message"
              role="status"
            >
              <CheckCircle2 size={18} />

              <span>
                {mensajeCompartido}
              </span>
            </div>
          )}

          <section className="product-detail-card">
            <h2>Detalles</h2>

            <dl>
              <div>
                <dt>Condición</dt>
                <dd>
                  {articulo.condicion}
                </dd>
              </div>

              <div>
                <dt>Categoría</dt>
                <dd>
                  {articulo.categoria}
                </dd>
              </div>

              <div>
                <dt>Ubicación</dt>
                <dd>
                  {articulo.ubicacion ??
                    "No indicada"}
                </dd>
              </div>

              <div>
                <dt>Estado</dt>
                <dd>
                  {articulo.estado}
                </dd>
              </div>
            </dl>
          </section>

          <section className="product-detail-card">
            <h2>Descripción</h2>

            <p>
              {articulo.descripcion?.trim() ||
                "El vendedor todavía no ha agregado una descripción para este artículo."}
            </p>
          </section>

          <section className="product-detail-seller">
            <div className="product-detail-seller-avatar">
              <UserRound size={22} />
            </div>

            <div>
              <span>Vendido por</span>

              <strong>
                {articulo.vendedor ??
                  "Vendedor"}
              </strong>
            </div>

            <Tag size={18} />
          </section>
        </aside>
      </div>
    </section>
  );
}

export default ProductDetail;