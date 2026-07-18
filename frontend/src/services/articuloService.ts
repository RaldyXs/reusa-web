import type {
  Articulo,
  RespuestaArticulos,
} from "../interfaces/articulo";

const API_URL = "http://localhost:3000/api/articulos";

export async function obtenerArticulos(): Promise<Articulo[]> {
  const respuesta = await fetch(API_URL);

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener los artículos");
  }

  const datos: RespuestaArticulos = await respuesta.json();

  return datos.articulos;
}

export async function buscarArticulos(
  termino: string,
): Promise<Articulo[]> {
  const parametros = new URLSearchParams();

  if (termino.trim()) {
    parametros.set("termino", termino.trim());
  }

  const url = parametros.toString()
    ? `${API_URL}?${parametros.toString()}`
    : API_URL;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error("No se pudo realizar la búsqueda");
  }

  const datos: RespuestaArticulos = await respuesta.json();

  return datos.articulos;
}