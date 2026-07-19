import {
  Car,
  Home,
  Laptop,
  Shirt,
} from "lucide-react";

const categorias = [
  {
    nombre: "Electrónica",
    icono: Laptop,
  },
  {
    nombre: "Hogar",
    icono: Home,
  },
  {
    nombre: "Vehículos",
    icono: Car,
  },
  {
    nombre: "Ropa",
    icono: Shirt,
  },
];

function FeaturedPanel() {
  return (
    <aside className="featured-panel">
      <section className="featured-card">
        <div className="featured-card__header">
          <h2>Destacado</h2>
          <button type="button">Ver todos</button>
        </div>

        <div className="featured-card__product">
          <div className="featured-card__image">
            Producto destacado
          </div>

          <div className="featured-card__overlay">
            <span>Destacado</span>
            <strong>Artículo especial</strong>
          </div>
        </div>
      </section>

      <section
        id="categorias"
        className="popular-categories"
      >
        <h2>Categorías populares</h2>

        <div className="popular-categories__list">
          {categorias.map((categoria) => {
            const Icono = categoria.icono;

            return (
              <button
                key={categoria.nombre}
                type="button"
              >
                <span>
                  <Icono size={17} />
                </span>

                {categoria.nombre}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}

export default FeaturedPanel;