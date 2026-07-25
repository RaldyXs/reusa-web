import {
  BookOpen,
  BriefcaseBusiness,
  Car,
  Dumbbell,
  Gamepad2,
  House,
  Laptop,
  Package,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  TabletSmartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

interface Categoria {
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  activo: number;
}

interface RespuestaCategorias {
  ok: boolean;
  categorias?: Categoria[];
  message?: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

const iconosPorCategoria: Record<
  string,
  LucideIcon
> = {
  vehiculos: Car,
  vehiculo: Car,
  propiedades: House,
  propiedad: House,
  celulares: Smartphone,
  celular: Smartphone,
  computadoras: Laptop,
  computadora: Laptop,
  electronica: TabletSmartphone,
  videojuegos: Gamepad2,
  videojuego: Gamepad2,
  hogar: House,
  muebles: Sofa,
  mueble: Sofa,
  moda: Shirt,
  ropa: Shirt,
  deportes: Dumbbell,
  deporte: Dumbbell,
  mascotas: PawPrint,
  mascota: PawPrint,
  herramientas: Wrench,
  herramienta: Wrench,
  empleos: BriefcaseBusiness,
  empleo: BriefcaseBusiness,
  servicios: Sparkles,
  servicio: Sparkles,
  libros: BookOpen,
  libro: BookOpen,
};

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function obtenerIconoCategoria(
  nombre: string,
): LucideIcon {
  return (
    iconosPorCategoria[
      normalizarTexto(nombre)
    ] ?? Package
  );
}

function Categories() {
  const navigate = useNavigate();

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarCategorias(): Promise<void> {
      try {
        setCargando(true);
        setError("");

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
          setCargando(false);
        }
      }
    }

    void cargarCategorias();

    return () => {
      componenteActivo = false;
    };
  }, []);

  function abrirCategoria(nombre: string): void {
    const categoria =
      encodeURIComponent(nombre);

    navigate(
      `/marketplace?categoria=${categoria}`,
    );
  }

  return (
    <section className="categories-page">
      <header className="categories-page__header">
        <span>Marketplace</span>

        <h1>Explora las categorías</h1>

        <p>
          Descubre artículos y servicios
          publicados por nuestra comunidad.
          Encuentra exactamente lo que estás
          buscando.
        </p>
      </header>

      {cargando && (
        <div
          className="categories-help"
          role="status"
        >
          <div>
            <span>Cargando</span>

            <h2>
              Cargando categorías...
            </h2>

            <p>
              Estamos consultando las categorías
              disponibles.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      {!cargando &&
        !error &&
        categorias.length === 0 && (
          <div className="categories-help">
            <div>
              <span>Marketplace</span>

              <h2>
                No hay categorías disponibles
              </h2>

              <p>
                Todavía no existen categorías
                activas en el sistema.
              </p>
            </div>
          </div>
        )}

      {!cargando &&
        !error &&
        categorias.length > 0 && (
          <div
            className="categories-grid"
            aria-label="Categorías del marketplace"
          >
            {categorias.map((categoria) => {
              const Icono =
                obtenerIconoCategoria(
                  categoria.nombre,
                );

              return (
                <button
                  key={categoria.categoria_id}
                  type="button"
                  className="category-card"
                  onClick={() =>
                    abrirCategoria(
                      categoria.nombre,
                    )
                  }
                >
                  <span className="category-card__icon">
                    <Icono
                      size={23}
                      strokeWidth={1.8}
                    />
                  </span>

                  <strong>
                    {categoria.nombre}
                  </strong>
                </button>
              );
            })}
          </div>
        )}

      <aside className="categories-help">
        <div>
          <span>Destacado</span>

          <h2>
            ¿No encuentras lo que estás
            buscando?
          </h2>

          <p>
            Usa el buscador principal o explora
            las publicaciones recientes del
            marketplace.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/marketplace")
          }
        >
          Ver marketplace
        </button>
      </aside>
    </section>
  );
}

export default Categories;