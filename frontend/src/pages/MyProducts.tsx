import {
  Archive,
  CheckCircle2,
  Eye,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Tag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import type { Articulo } from "../interfaces/articulo";
import {
  actualizarArchivadoArticulo,
  actualizarEstadoArticulo,
  obtenerArticulos,
  type EstadoArticulo,
} from "../services/articuloService";

type FiltroPublicaciones =
  | "todas"
  | "activas"
  | "vendidas"
  | "archivadas";

function MyProducts() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [articulos, setArticulos] =
    useState<Articulo[]>([]);

  const [filtro, setFiltro] =
    useState<FiltroPublicaciones>("todas");

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] = useState("");

  const [articuloProcesando, setArticuloProcesando] =
    useState<number | null>(null);

  useEffect(() => {
    let componenteActivo = true;

    async function cargarPublicaciones() {
      try {
        setCargando(true);
        setError("");

        if (!usuario) {
          throw new Error(
            "Debes iniciar sesión para ver tus publicaciones",
          );
        }

        const datos = await obtenerArticulos();

        const publicacionesDelUsuario =
          datos.filter(
            (articulo) =>
              Number(articulo.vendedor_id) ===
              Number(usuario.usuarioId),
          );

        if (componenteActivo) {
          setArticulos(
            publicacionesDelUsuario,
          );
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
  }, [usuario]);

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

  async function cambiarArchivado(
    articuloId: number,
    archivado: boolean,
  ): Promise<void> {
    try {
      setError("");
      setArticuloProcesando(articuloId);

      const articuloActualizado =
        await actualizarArchivadoArticulo(
          articuloId,
          archivado,
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
          : "No se pudo archivar la publicación",
      );
    } finally {
      setArticuloProcesando(null);
    }
  }

  const activas = articulos.filter(
    (articulo) =>
      (articulo.estado ?? "activo") ===
        "activo" &&
      Number(articulo.archivado ?? 0) === 0,
  ).length;

  const vendidas = articulos.filter(
    (articulo) =>
      articulo.estado === "vendido" &&
      Number(articulo.archivado ?? 0) === 0,
  ).length;

  const archivadas = articulos.filter(
    (articulo) =>
      Number(articulo.archivado ?? 0) === 1,
  ).length;

  const articulosVisibles = useMemo(() => {
    if (filtro === "activas") {
      return articulos.filter(
        (articulo) =>
          (articulo.estado ?? "activo") ===
            "activo" &&
          Number(articulo.archivado ?? 0) === 0,
      );
    }

    if (filtro === "vendidas") {
      return articulos.filter(
        (articulo) =>
          articulo.estado === "vendido" &&
          Number(articulo.archivado ?? 0) === 0,
      );
    }

    if (filtro === "archivadas") {
      return articulos.filter(
        (articulo) =>
          Number(articulo.archivado ?? 0) === 1,
      );
    }

    return articulos.filter(
      (articulo) =>
        Number(articulo.archivado ?? 0) === 0,
    );
  }, [articulos, filtro]);

  return (
    <section className="my-products-page">
      <header className="my-products-header">
        <div>
          <span>Mi cuenta</span>

          <h1>Mis publicaciones</h1>

          <p>
            Administra tus artículos, revisa su
            estado y crea nuevas publicaciones.
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

      <div className="my-products-filters">
        <button
          type="button"
          className={
            filtro === "todas" ? "active" : ""
          }
          onClick={() => setFiltro("todas")}
        >
          Todas
        </button>

        <button
          type="button"
          className={
            filtro === "activas" ? "active" : ""
          }
          onClick={() => setFiltro("activas")}
        >
          Activas
        </button>

        <button
          type="button"
          className={
            filtro === "vendidas" ? "active" : ""
          }
          onClick={() => setFiltro("vendidas")}
        >
          Vendidas
        </button>

        <button
          type="button"
          className={
            filtro === "archivadas"
              ? "active"
              : ""
          }
          onClick={() => setFiltro("archivadas")}
        >
          Archivadas
        </button>
      </div>

      {error ? (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      ) : cargando ? (
        <p className="status-message">
          Cargando tus publicaciones...
        </p>
      ) : articulos.length === 0 ? (
        <div className="my-products-empty">
          <Package size={38} />

          <h2>
            Todavía no tienes publicaciones
          </h2>

          <p>
            Publica tu primer artículo para que
            aparezca en el marketplace.
          </p>

          <button
            type="button"
            onClick={() => navigate("/publicar")}
          >
            Crear publicación
          </button>
        </div>
      ) : articulosVisibles.length === 0 ? (
        <div className="my-products-empty">
          <Package size={38} />

          <h2>
            No hay publicaciones en esta sección
          </h2>

          <p>
            Cambia de filtro para revisar otras
            publicaciones.
          </p>
        </div>
      ) : (
        <div className="my-products-grid">
          {articulosVisibles.map((articulo) => {
            const precio = Number(
              articulo.precio,
            ).toLocaleString("es-DO", {
              style: "currency",
              currency: "DOP",
              maximumFractionDigits: 0,
            });

            const estadoActual =
              articulo.estado ?? "activo";

            const estaActivo =
              estadoActual === "activo";

            const estaVendido =
              estadoActual === "vendido";

            const estaArchivado =
              Number(
                articulo.archivado ?? 0,
              ) === 1;

            const estaProcesando =
              articuloProcesando ===
              articulo.articulo_id;

            const textoEstado = estaArchivado
              ? estadoActual === "vendido"
                ? "Vendido · Archivado"
                : "Activo · Archivado"
              : estadoActual;

            return (
              <article
                className="my-product-card"
                key={articulo.articulo_id}
              >
                <div className="my-product-card__image">
                  {articulo.imagen_principal ? (
                    <img
                      src={
                        articulo.imagen_principal
                      }
                      alt={articulo.titulo}
                    />
                  ) : (
                    <span>{articulo.titulo}</span>
                  )}

                  <small
                    className={`my-product-card__status my-product-card__status--${estaArchivado ? "archivado" : estadoActual}`}
                  >
                    {textoEstado}
                  </small>
                </div>

                <div className="my-product-card__content">
                  <span>
                    {articulo.categoria}
                  </span>

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
                      disabled={
                        estaProcesando ||
                        estaArchivado
                      }
                      onClick={() =>
                        navigate(
                          `/editar-publicacion/${articulo.articulo_id}`,
                        )
                      }
                    >
                      <Pencil size={16} />
                      Editar
                    </button>

                    {!estaArchivado && estaActivo && (
                      <button
                        type="button"
                        disabled={estaProcesando}
                        onClick={() =>
                          void cambiarEstado(
                            articulo.articulo_id,
                            "vendido",
                          )
                        }
                      >
                        <CheckCircle2 size={16} />

                        {estaProcesando
                          ? "Guardando..."
                          : "Marcar vendido"}
                      </button>
                    )}

                    {!estaArchivado && estaVendido && (
                      <button
                        type="button"
                        disabled={estaProcesando}
                        onClick={() =>
                          void cambiarEstado(
                            articulo.articulo_id,
                            "activo",
                          )
                        }
                      >
                        <RotateCcw size={16} />

                        {estaProcesando
                          ? "Guardando..."
                          : "Volver a activar"}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={estaProcesando}
                      onClick={() =>
                        void cambiarArchivado(
                          articulo.articulo_id,
                          !estaArchivado,
                        )
                      }
                    >
                      {estaArchivado ? (
                        <RotateCcw size={16} />
                      ) : (
                        <Archive size={16} />
                      )}

                      {estaProcesando
                        ? "Guardando..."
                        : estaArchivado
                          ? "Desarchivar"
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