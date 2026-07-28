import {
  BarChart3,
  FileCheck2,
  FileClock,
  FileText,
  FolderTree,
  RefreshCw,
  ShoppingBag,
  Tags,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  obtenerEstadisticasAdmin,
  obtenerPublicacionesAdmin,
  obtenerResumenAdmin,
  obtenerUsuariosAdmin,
  type EstadisticaCategoriaAdministracion,
  type EstadisticaEstadoPublicacion,
  type EstadisticaMensualAdministracion,
  type EstadisticasDashboardAdministracion,
  type PublicacionAdministracion,
  type ResumenAdministracion,
  type UsuarioAdministracion,
} from "../../services/adminService";

const NOMBRES_MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatearFecha(fecha: string): string {
  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fechaConvertida);
}

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }).format(Number(precio));
}

function obtenerEstadoPublicacion(
  publicacion: PublicacionAdministracion,
): string {
  if (
    publicacion.archivado === 1 ||
    publicacion.estado === "archivado"
  ) {
    return "Archivada";
  }

  if (publicacion.estado === "vendido") {
    return "Vendida";
  }

  return "Activa";
}

function obtenerNombreMes(
  estadistica: EstadisticaMensualAdministracion,
): string {
  const nombreMes =
    NOMBRES_MESES[estadistica.mes - 1] ??
    estadistica.periodo;

  return `${nombreMes} ${estadistica.anio}`;
}

function obtenerMaximo(
  valores: number[],
): number {
  const maximo = Math.max(
    ...valores.map((valor) => Number(valor)),
    0,
  );

  return maximo > 0 ? maximo : 1;
}

function calcularPorcentaje(
  valor: number,
  maximo: number,
): number {
  if (maximo <= 0) {
    return 0;
  }

  return Math.max(
    4,
    Math.round(
      (Number(valor) / Number(maximo)) * 100,
    ),
  );
}

function normalizarTotal(
  valor: number,
): number {
  const total = Number(valor);

  return Number.isFinite(total)
    ? total
    : 0;
}

interface GraficoMensualProps {
  titulo: string;
  subtitulo: string;
  datos: EstadisticaMensualAdministracion[];
  mensajeVacio: string;
}

function GraficoMensual({
  titulo,
  subtitulo,
  datos,
  mensajeVacio,
}: GraficoMensualProps) {
  const maximo = obtenerMaximo(
    datos.map((dato) =>
      normalizarTotal(dato.total),
    ),
  );

  return (
    <section className="admin-chart-card">
      <header className="admin-chart-card__header">
        <div>
          <span>TENDENCIA MENSUAL</span>
          <h2>{titulo}</h2>
          <p>{subtitulo}</p>
        </div>

        <div className="admin-chart-card__icon">
          <TrendingUp size={19} />
        </div>
      </header>

      {datos.length === 0 ? (
        <p className="admin-chart-empty">
          {mensajeVacio}
        </p>
      ) : (
        <div className="admin-monthly-chart">
          {datos.map((dato) => {
            const total =
              normalizarTotal(dato.total);

            const altura =
              calcularPorcentaje(
                total,
                maximo,
              );

            return (
              <div
                key={dato.periodo}
                className="admin-monthly-chart__column"
              >
                <span className="admin-monthly-chart__value">
                  {total}
                </span>

                <div className="admin-monthly-chart__track">
                  <div
                    className="admin-monthly-chart__bar"
                    style={{
                      height: `${altura}%`,
                    }}
                  />
                </div>

                <small>
                  {obtenerNombreMes(dato)}
                </small>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface GraficoEstadosProps {
  datos: EstadisticaEstadoPublicacion[];
}

function GraficoEstados({
  datos,
}: GraficoEstadosProps) {
  const totalGeneral = datos.reduce(
    (acumulado, elemento) =>
      acumulado +
      normalizarTotal(elemento.total),
    0,
  );

  const etiquetas = {
    activo: "Activas",
    vendido: "Vendidas",
    archivado: "Archivadas",
  };

  return (
    <section className="admin-chart-card">
      <header className="admin-chart-card__header">
        <div>
          <span>DISTRIBUCIÓN</span>
          <h2>Estado de publicaciones</h2>
          <p>
            Proporción actual según el estado de
            cada publicación.
          </p>
        </div>

        <div className="admin-chart-card__icon">
          <BarChart3 size={19} />
        </div>
      </header>

      {datos.length === 0 ? (
        <p className="admin-chart-empty">
          No hay publicaciones para analizar.
        </p>
      ) : (
        <div className="admin-progress-list">
          {datos.map((dato) => {
            const total =
              normalizarTotal(dato.total);

            const porcentaje =
              totalGeneral > 0
                ? Math.round(
                    (total / totalGeneral) *
                      100,
                  )
                : 0;

            return (
              <article
                key={dato.estado}
                className="admin-progress-item"
              >
                <div className="admin-progress-item__header">
                  <div>
                    <span
                      className={`admin-progress-dot admin-progress-dot--${dato.estado}`}
                    />

                    <strong>
                      {etiquetas[dato.estado]}
                    </strong>
                  </div>

                  <span>
                    {total} · {porcentaje}%
                  </span>
                </div>

                <div className="admin-progress-track">
                  <div
                    className={`admin-progress-bar admin-progress-bar--${dato.estado}`}
                    style={{
                      width: `${porcentaje}%`,
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface GraficoCategoriasProps {
  datos: EstadisticaCategoriaAdministracion[];
}

function GraficoCategorias({
  datos,
}: GraficoCategoriasProps) {
  const categoriasPrincipales =
    datos.slice(0, 8);

  const maximo = obtenerMaximo(
    categoriasPrincipales.map((dato) =>
      normalizarTotal(dato.total),
    ),
  );

  return (
    <section className="admin-chart-card">
      <header className="admin-chart-card__header">
        <div>
          <span>CATEGORÍAS</span>
          <h2>Publicaciones por categoría</h2>
          <p>
            Categorías con mayor cantidad de
            artículos registrados.
          </p>
        </div>

        <div className="admin-chart-card__icon">
          <Tags size={19} />
        </div>
      </header>

      {categoriasPrincipales.length === 0 ? (
        <p className="admin-chart-empty">
          No hay categorías para mostrar.
        </p>
      ) : (
        <div className="admin-category-chart">
          {categoriasPrincipales.map(
            (dato) => {
              const total =
                normalizarTotal(dato.total);

              const porcentaje =
                calcularPorcentaje(
                  total,
                  maximo,
                );

              return (
                <article
                  key={dato.categoria_id}
                  className="admin-category-chart__item"
                >
                  <div className="admin-category-chart__header">
                    <strong>
                      {dato.categoria}
                    </strong>

                    <span>{total}</span>
                  </div>

                  <div className="admin-category-chart__track">
                    <div
                      className="admin-category-chart__bar"
                      style={{
                        width: `${porcentaje}%`,
                      }}
                    />
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [resumen, setResumen] =
    useState<ResumenAdministracion | null>(null);

  const [estadisticas, setEstadisticas] =
    useState<
      EstadisticasDashboardAdministracion | null
    >(null);

  const [usuarios, setUsuarios] =
    useState<UsuarioAdministracion[]>([]);

  const [publicaciones, setPublicaciones] =
    useState<PublicacionAdministracion[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [actualizando, setActualizando] =
    useState(false);

  const [error, setError] =
    useState("");

  const cargarDatos = useCallback(
    async (
      mostrarActualizacion = false,
    ): Promise<void> => {
      try {
        setError("");

        if (mostrarActualizacion) {
          setActualizando(true);
        } else {
          setCargando(true);
        }

        const [
          resumenRecibido,
          estadisticasRecibidas,
          usuariosRecibidos,
          publicacionesRecibidas,
        ] = await Promise.all([
          obtenerResumenAdmin(),
          obtenerEstadisticasAdmin(),
          obtenerUsuariosAdmin(),
          obtenerPublicacionesAdmin(),
        ]);

        setResumen(resumenRecibido);
        setEstadisticas(
          estadisticasRecibidas,
        );
        setUsuarios(usuariosRecibidos);
        setPublicaciones(
          publicacionesRecibidas,
        );
      } catch (errorDesconocido) {
        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el panel administrativo",
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
        void cargarDatos();
      }, 0);

    return () => {
      window.clearTimeout(
        temporizador,
      );
    };
  }, [cargarDatos]);

  const publicacionesRecientes =
    useMemo(
      () => publicaciones.slice(0, 5),
      [publicaciones],
    );

  const usuariosRecientes =
    useMemo(
      () => usuarios.slice(0, 5),
      [usuarios],
    );

  if (cargando) {
    return (
      <section className="admin-dashboard-page">
        <p className="status-message">
          Cargando panel administrativo...
        </p>
      </section>
    );
  }

  return (
    <section className="admin-dashboard-page">
      <header className="admin-content-header">
        <div>
          <span>RESUMEN GENERAL</span>

          <h1>
            Vista general de la plataforma
          </h1>

          <p>
            Consulta el estado actual de
            usuarios, publicaciones y
            categorías.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          disabled={actualizando}
          onClick={() =>
            void cargarDatos(true)
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
      </header>

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      {resumen && (
        <div className="admin-dashboard-cards">
          <article className="admin-dashboard-card">
            <div className="admin-dashboard-card__icon">
              <Users size={22} />
            </div>

            <span>
              Usuarios registrados
            </span>

            <strong>
              {resumen.total_usuarios}
            </strong>

            <small>
              {resumen.usuarios_activos} activos
            </small>
          </article>

          <article className="admin-dashboard-card">
            <div className="admin-dashboard-card__icon">
              <UserCheck size={22} />
            </div>

            <span>Usuarios activos</span>

            <strong>
              {resumen.usuarios_activos}
            </strong>

            <small>
              Cuentas habilitadas
            </small>
          </article>

          <article className="admin-dashboard-card">
            <div className="admin-dashboard-card__icon">
              <FileText size={22} />
            </div>

            <span>Publicaciones</span>

            <strong>
              {resumen.total_publicaciones}
            </strong>

            <small>
              {resumen.publicaciones_activas} activas
            </small>
          </article>

          <article className="admin-dashboard-card">
            <div className="admin-dashboard-card__icon">
              <ShoppingBag size={22} />
            </div>

            <span>Vendidas</span>

            <strong>
              {resumen.publicaciones_vendidas}
            </strong>

            <small>
              Ventas completadas
            </small>
          </article>

          <article className="admin-dashboard-card">
            <div className="admin-dashboard-card__icon">
              <FileClock size={22} />
            </div>

            <span>Archivadas</span>

            <strong>
              {resumen.publicaciones_archivadas}
            </strong>

            <small>
              Fuera del marketplace
            </small>
          </article>

          <article className="admin-dashboard-card">
            <div className="admin-dashboard-card__icon">
              <FolderTree size={22} />
            </div>

            <span>Categorías</span>

            <strong>
              {resumen.total_categorias}
            </strong>

            <small>
              Categorías activas
            </small>
          </article>
        </div>
      )}

      {estadisticas && (
        <div className="admin-statistics-grid">
          <GraficoMensual
            titulo="Usuarios registrados"
            subtitulo="Nuevas cuentas creadas durante los últimos 12 meses."
            datos={
              estadisticas.usuarios_por_mes
            }
            mensajeVacio="No hay registros mensuales de usuarios."
          />

          <GraficoMensual
            titulo="Publicaciones creadas"
            subtitulo="Artículos publicados durante los últimos 12 meses."
            datos={
              estadisticas.publicaciones_por_mes
            }
            mensajeVacio="No hay registros mensuales de publicaciones."
          />

          <GraficoEstados
            datos={
              estadisticas.publicaciones_por_estado
            }
          />

          <GraficoCategorias
            datos={
              estadisticas.publicaciones_por_categoria
            }
          />
        </div>
      )}

      <div className="admin-dashboard-grid">
        <section className="admin-dashboard-panel">
          <header className="admin-dashboard-panel__header">
            <div>
              <span>PUBLICACIONES</span>

              <h2>
                Publicaciones recientes
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/publicaciones",
                )
              }
            >
              Ver todas
            </button>
          </header>

          {publicacionesRecientes.length ===
          0 ? (
            <p className="status-message">
              No hay publicaciones
              registradas.
            </p>
          ) : (
            <div className="admin-dashboard-list">
              {publicacionesRecientes.map(
                (publicacion) => {
                  const estado =
                    obtenerEstadoPublicacion(
                      publicacion,
                    );

                  return (
                    <article
                      key={
                        publicacion.articulo_id
                      }
                      className="admin-dashboard-list__item"
                    >
                      <div className="admin-dashboard-list__icon">
                        <FileCheck2
                          size={18}
                        />
                      </div>

                      <div className="admin-dashboard-list__content">
                        <strong>
                          {
                            publicacion.titulo
                          }
                        </strong>

                        <span>
                          {
                            publicacion.vendedor_nombre
                          }{" "}
                          ·{" "}
                          {
                            publicacion.categoria
                          }
                        </span>
                      </div>

                      <div className="admin-dashboard-list__meta">
                        <strong>
                          {formatearPrecio(
                            publicacion.precio,
                          )}
                        </strong>

                        <span
                          className={`admin-status admin-status--${estado.toLowerCase()}`}
                        >
                          {estado}
                        </span>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>

        <section className="admin-dashboard-panel">
          <header className="admin-dashboard-panel__header">
            <div>
              <span>USUARIOS</span>

              <h2>Registros recientes</h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/usuarios",
                )
              }
            >
              Ver todos
            </button>
          </header>

          {usuariosRecientes.length ===
          0 ? (
            <p className="status-message">
              No hay usuarios registrados.
            </p>
          ) : (
            <div className="admin-dashboard-list">
              {usuariosRecientes.map(
                (usuario) => (
                  <article
                    key={usuario.usuario_id}
                    className="admin-dashboard-list__item"
                  >
                    <div className="admin-dashboard-avatar">
                      {usuario.nombre
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="admin-dashboard-list__content">
                      <strong>
                        {usuario.nombre}{" "}
                        {usuario.apellido}
                      </strong>

                      <span>
                        {usuario.email}
                      </span>
                    </div>

                    <div className="admin-dashboard-list__meta">
                      <span
                        className={
                          usuario.activo === 1
                            ? "admin-status admin-status--activa"
                            : "admin-status admin-status--inactiva"
                        }
                      >
                        {usuario.activo === 1
                          ? "Activo"
                          : "Inactivo"}
                      </span>

                      <small>
                        {formatearFecha(
                          usuario.fecha_registro,
                        )}
                      </small>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default AdminDashboard;