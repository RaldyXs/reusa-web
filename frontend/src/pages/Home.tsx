import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import type { Articulo } from "../interfaces/articulo";
import {
  buscarArticulos,
  obtenerArticulos,
} from "../services/articuloService";

function Home() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");



  async function manejarBusqueda(termino: string) {
    try {
      setCargando(true);
      setError("");

      const datos = await buscarArticulos(termino);
      setArticulos(datos);
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "Ocurrió un error inesperado";

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
  let activo = true;

  async function cargar() {
    try {
      const datos = await obtenerArticulos();

      if (activo) {
        setArticulos(datos);
      }
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "Ocurrió un error inesperado";

      if (activo) {
        setError(mensaje);
      }
    } finally {
      if (activo) {
        setCargando(false);
      }
    }
  }

  void cargar();

  return () => {
    activo = false;
  };
}, []);

  return (
    <main className="home-page">
      <section className="home-header">
        <div>
          <h1>Artículos disponibles</h1>
          <p>
            Encuentra productos nuevos, usados y reparados.
          </p>
        </div>

        <SearchBar
          onSearch={manejarBusqueda}
          cargando={cargando}
        />
      </section>

      {error && <p className="error-message">{error}</p>}

      {cargando ? (
        <p className="status-message">
          Cargando artículos...
        </p>
      ) : articulos.length === 0 ? (
        <p className="status-message">
          No se encontraron artículos.
        </p>
      ) : (
        <>
          <p className="results-count">
            {articulos.length} artículos encontrados
          </p>

          <section className="products-grid">
            {articulos.map((articulo) => (
              <ProductCard
                key={articulo.articulo_id}
                articulo={articulo}
              />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default Home;