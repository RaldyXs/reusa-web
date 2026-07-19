import type { Articulo } from "../interfaces/articulo";

const API_URL = "http://localhost:3000/api/articulos";

interface ArticulosResponse {
  ok: boolean;
  total: number;
  articulos: Articulo[];
  message?: string;
}

interface ArticuloResponse {
  ok: boolean;
  articulo?: Articulo;
  message?: string;
}

export interface CrearArticuloDatos {
  titulo: string;
  descripcion: string;
  precio: number;
  condicion: "nuevo" | "usado" | "reparado";
  ubicacion: string;
  categoriaId: number;
  vendedorId: number;
}

export async function obtenerArticulos(): Promise<Articulo[]> {
  const response = await fetch(API_URL);
  const data = (await response.json()) as ArticulosResponse;

  if (!response.ok || !data.ok) {
    throw new Error(
      data.message ?? "No se pudieron obtener los artículos",
    );
  }

  return data.articulos;
}

export async function buscarArticulos(
  termino: string,
): Promise<Articulo[]> {
  const parametros = new URLSearchParams();
  parametros.set("termino", termino);

  const response = await fetch(
    `${API_URL}?${parametros.toString()}`,
  );

  const data = (await response.json()) as ArticulosResponse;

  if (!response.ok || !data.ok) {
    throw new Error(
      data.message ?? "No se pudo realizar la búsqueda",
    );
  }

  return data.articulos;
}

export async function obtenerArticuloPorId(
  articuloId: number,
): Promise<Articulo> {
  const response = await fetch(`${API_URL}/${articuloId}`);
  const data = (await response.json()) as ArticuloResponse;

  if (!response.ok || !data.ok || !data.articulo) {
    throw new Error(
      data.message ?? "No se pudo obtener el artículo",
    );
  }

  return data.articulo;
}

export async function crearArticulo(
  datos: CrearArticuloDatos,
): Promise<Articulo> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  const resultado = (await response.json()) as ArticuloResponse;

  if (
    !response.ok ||
    !resultado.ok ||
    !resultado.articulo
  ) {
    throw new Error(
      resultado.message ??
        "No se pudo publicar el artículo",
    );
  }

  return resultado.articulo;
}