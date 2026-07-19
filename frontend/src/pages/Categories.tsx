import {
  BookOpen,
  BriefcaseBusiness,
  Car,
  Dumbbell,
  Gamepad2,
  House,
  Laptop,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  TabletSmartphone,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const categorias = [
  {
    nombre: "Vehículos",
    icono: Car,
  },
  {
    nombre: "Propiedades",
    icono: House,
  },
  {
    nombre: "Celulares",
    icono: Smartphone,
  },
  {
    nombre: "Computadoras",
    icono: Laptop,
  },
  {
    nombre: "Electrónica",
    icono: TabletSmartphone,
  },
  {
    nombre: "Videojuegos",
    icono: Gamepad2,
  },
  {
    nombre: "Hogar",
    icono: House,
  },
  {
    nombre: "Muebles",
    icono: Sofa,
  },
  {
    nombre: "Moda",
    icono: Shirt,
  },
  {
    nombre: "Deportes",
    icono: Dumbbell,
  },
  {
    nombre: "Mascotas",
    icono: PawPrint,
  },
  {
    nombre: "Herramientas",
    icono: Wrench,
  },
  {
    nombre: "Empleos",
    icono: BriefcaseBusiness,
  },
  {
    nombre: "Servicios",
    icono: Sparkles,
  },
  {
    nombre: "Libros",
    icono: BookOpen,
  },
];

function Categories() {
  const navigate = useNavigate();

  function abrirCategoria(nombre: string) {
    const categoria = encodeURIComponent(nombre);

    navigate(`/marketplace?categoria=${categoria}`);
  }

  return (
    <section className="categories-page">
      <header className="categories-page__header">
        <span>Marketplace</span>

        <h1>Explora las categorías</h1>

        <p>
          Descubre artículos y servicios publicados por nuestra
          comunidad. Encuentra exactamente lo que estás buscando.
        </p>
      </header>

      <div
        className="categories-grid"
        aria-label="Categorías del marketplace"
      >
        {categorias.map((categoria) => {
          const Icono = categoria.icono;

          return (
            <button
              key={categoria.nombre}
              type="button"
              className="category-card"
              onClick={() => abrirCategoria(categoria.nombre)}
            >
              <span className="category-card__icon">
                <Icono size={23} strokeWidth={1.8} />
              </span>

              <strong>{categoria.nombre}</strong>
            </button>
          );
        })}
      </div>

      <aside className="categories-help">
        <div>
          <span>Destacado</span>

          <h2>¿No encuentras lo que estás buscando?</h2>

          <p>
            Usa el buscador principal o explora las publicaciones
            recientes del marketplace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/marketplace")}
        >
          Ver marketplace
        </button>
      </aside>
    </section>
  );
}

export default Categories;