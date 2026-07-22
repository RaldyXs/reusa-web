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

interface SubirImagenesResponse {
  ok: boolean;
  articulo?: Articulo;
  imagenes?: string[];
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

export interface ActualizarArticuloDatos {
  titulo: string;
  descripcion: string;
  precio: number;
  condicion: "nuevo" | "usado" | "reparado";
  ubicacion: string;
  categoriaId: number;
}

export type EstadoArticulo =
  | "activo"
  | "vendido"
  | "archivado";

async function leerRespuestaArticulo(
  response: Response,
  mensajePredeterminado: string,
): Promise<Articulo> {
  const resultado =
    (await response.json()) as ArticuloResponse;

  if (
    !response.ok ||
    !resultado.ok ||
    !resultado.articulo
  ) {
    throw new Error(
      resultado.message ?? mensajePredeterminado,
    );
  }

  return resultado.articulo;
}

export async function obtenerArticulos(): Promise<Articulo[]> {
  const response = await fetch(API_URL);

  const data =
    (await response.json()) as ArticulosResponse;

  if (!response.ok || !data.ok) {
    throw new Error(
      data.message ??
        "No se pudieron obtener los artículos",
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

  const data =
    (await response.json()) as ArticulosResponse;

  if (!response.ok || !data.ok) {
    throw new Error(
      data.message ??
        "No se pudo realizar la búsqueda",
    );
  }

  return data.articulos;
}

export async function obtenerArticuloPorId(
  articuloId: number,
): Promise<Articulo> {
  const response = await fetch(
    `${API_URL}/${articuloId}`,
  );

  return leerRespuestaArticulo(
    response,
    "No se pudo obtener el artículo",
  );
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

  return leerRespuestaArticulo(
    response,
    "No se pudo publicar el artículo",
  );
}

export async function actualizarArticulo(
  articuloId: number,
  datos: ActualizarArticuloDatos,
): Promise<Articulo> {
  const response = await fetch(
    `${API_URL}/${articuloId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    },
  );

  return leerRespuestaArticulo(
    response,
    "No se pudo actualizar el artículo",
  );
}

export async function actualizarEstadoArticulo(
  articuloId: number,
  estado: EstadoArticulo,
): Promise<Articulo> {
  const response = await fetch(
    `${API_URL}/${articuloId}/estado`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado }),
    },
  );

  return leerRespuestaArticulo(
    response,
    "No se pudo actualizar el estado del artículo",
  );
}

export async function subirImagenesArticulo(
  articuloId: number,
  archivos: File[],
): Promise<Articulo> {
  if (archivos.length === 0) {
    return obtenerArticuloPorId(articuloId);
  }

  if (archivos.length > 5) {
    throw new Error(
      "Solo puedes subir un máximo de cinco imágenes",
    );
  }

  const formulario = new FormData();

  archivos.forEach((archivo) => {
    formulario.append("imagenes", archivo);
  });

  const response = await fetch(
    `${API_URL}/${articuloId}/imagenes`,
    {
      method: "POST",
      body: formulario,
    },
  );

  const resultado =
    (await response.json()) as SubirImagenesResponse;

  if (
    !response.ok ||
    !resultado.ok ||
    !resultado.articulo
  ) {
    throw new Error(
      resultado.message ??
        "No se pudieron guardar las imágenes",
    );
  }

  return resultado.articulo;
}

export async function eliminarImagenArticulo(
  articuloId: number,
  urlImagen: string,
): Promise<Articulo> {
  const response = await fetch(
    `${API_URL}/${articuloId}/imagenes`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urlImagen }),
    },
  );

  return leerRespuestaArticulo(
    response,
    "No se pudo eliminar la imagen",
  );
}