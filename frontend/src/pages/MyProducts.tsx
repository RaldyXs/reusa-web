import {
  Archive,
  Eye,
  Package,
  Pencil,
  Plus,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Articulo } from "../interfaces/articulo";
import {
  actualizarEstadoArticulo,
  obtenerArticulos,
  type EstadoArticulo,
} from "../services/articuloService";

function MyProducts() {
  const navigate = useNavigate();

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [articuloProcesando, setArticuloProcesando] =
    useState<number | null>(null);

  useEffect(() => {
    let componenteActivo = true;

    async function cargarPublicaciones() {
      try {
        setCargando(true);
        setError("");

        const datos = await obtenerArticulos();

        const publicacionesDelUsuario = datos.filter(
          (articulo) => Number(articulo.vendedor_id) === 1,
        );

        if (componenteActivo) {
          setArticulos(publicacionesDelUsuario);
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

    void cargarPublicaciones();

    return () => {
      componenteActivo = false;
    };
  }, []);

  async function cambiarEstado(
    articuloId: number,
    estado: EstadoArticulo,
  ): Promise<void> {
    try {
      setError("");
      setArticuloProcesando(articuloId);

      const articuloActualizado =
        await actualizarEstadoArticulo(
          articuloId,
          estado,
        );

      setArticulos((articulosActuales) =>
        articulosActuales.map((articulo) =>
          articulo.articulo_id === articuloId
            ? articuloActualizado
            : articulo,
        ),
      );
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar la publicación",
      );
    } finally {
      setArticuloProcesando(null);
    }
  }

  const activas = articulos.filter(
    (articulo) => articulo.estado === "activo",
  ).length;

  const vendidas = articulos.filter(
    (articulo) => articulo.estado === "vendido",
  ).length;

  const archivadas = articulos.filter(
    (articulo) => articulo.estado === "archivado",
  ).length;

  return (
    <section className="my-products-page">
      <header className="my-products-header">
        <div>
          <span>Mi cuenta</span>

          <h1>Mis publicaciones</h1>

          <p>
            Administra tus artículos, revisa su estado y crea
            nuevas publicaciones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/publicar")}
        >
          <Plus size={18} />
          Nueva publicación
        </button>
      </header>

      <div className="my-products-summary">
        <article>
          <Package size={20} />

          <div>
            <strong>{articulos.length}</strong>
            <span>Total</span>
          </div>
        </article>

        <article>
          <Eye size={20} />

          <div>
            <strong>{activas}</strong>
            <span>Activas</span>
          </div>
        </article>

        <article>
          <Tag size={20} />

          <div>
            <strong>{vendidas}</strong>
            <span>Vendidas</span>
          </div>
        </article>

        <article>
          <Archive size={20} />

          <div>
            <strong>{archivadas}</strong>
            <span>Archivadas</span>
          </div>
        </article>
      </div>

      {error ? (
        <div className="error-message" role="alert">
          {error}
        </div>
      ) : cargando ? (
        <p className="status-message">
          Cargando tus publicaciones...
        </p>
      ) : articulos.length === 0 ? (
        <div className="my-products-empty">
          <Package size={38} />

          <h2>Todavía no tienes publicaciones</h2>

          <p>
            Publica tu primer artículo para que aparezca en el
            marketplace.
          </p>

          <button
            type="button"
            onClick={() => navigate("/publicar")}
          >
            Crear publicación
          </button>
        </div>
      ) : (
        <div className="my-products-grid">
          {articulos.map((articulo) => {
            const precio = Number(
              articulo.precio,
            ).toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
              maximumFractionDigits: 0,
            });

            const estadoActual =
              articulo.estado ?? "activo";

            const estaArchivado =
              estadoActual === "archivado";

            const estaProcesando =
              articuloProcesando === articulo.articulo_id;

            return (
              <article
                className="my-product-card"
                key={articulo.articulo_id}
              >
                <div className="my-product-card__image">
                  {articulo.imagen_principal ? (
                    <img
                      src={articulo.imagen_principal}
                      alt={articulo.titulo}
                    />
                  ) : (
                    <span>{articulo.titulo}</span>
                  )}

                  <small
                    className={`my-product-card__status my-product-card__status--${estadoActual}`}
                  >
                    {estadoActual}
                  </small>
                </div>

                <div className="my-product-card__content">
                  <span>{articulo.categoria}</span>

                  <h2>{articulo.titulo}</h2>

                  <strong>{precio}</strong>

                  <div className="my-product-card__actions">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/producto/${articulo.articulo_id}`,
                        )
                      }
                    >
                      <Eye size={16} />
                      Ver
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/editar-publicacion/${articulo.articulo_id}`,
                        )
                      }
                    >
                      <Pencil size={16} />
                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={estaProcesando}
                      onClick={() =>
                        void cambiarEstado(
                          articulo.articulo_id,
                          estaArchivado
                            ? "activo"
                            : "archivado",
                        )
                      }
                    >
                      <Archive size={16} />

                      {estaProcesando
                        ? "Guardando..."
                        : estaArchivado
                          ? "Activar"
                          : "Archivar"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyProducts;