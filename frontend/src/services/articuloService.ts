import type { Articulo } from "../interfaces/articulo";
import type { Sesion } from "../interfaces/auth";

const API_URL = "http://localhost:3000/api/articulos";
const CLAVE_SESION = "reusa_sesion";

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
  | "vendido";

function obtenerToken(): string {
  const sesionGuardada =
    localStorage.getItem(CLAVE_SESION);

  if (!sesionGuardada) {
    throw new Error(
      "Debes iniciar sesión para realizar esta acción",
    );
  }

  try {
    const sesion =
      JSON.parse(sesionGuardada) as Sesion;

    if (!sesion.token) {
      throw new Error();
    }

    return sesion.token;
  } catch {
    localStorage.removeItem(CLAVE_SESION);

    throw new Error(
      "La sesión guardada no es válida. Inicia sesión nuevamente",
    );
  }
}

function obtenerHeadersAutenticados(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${obtenerToken()}`,
  };
}

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
    headers: obtenerHeadersAutenticados(),
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
      headers: obtenerHeadersAutenticados(),
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
      headers: obtenerHeadersAutenticados(),
      body: JSON.stringify({ estado }),
    },
  );

  return leerRespuestaArticulo(
    response,
    "No se pudo actualizar el estado del artículo",
  );
}

export async function actualizarArchivadoArticulo(
  articuloId: number,
  archivado: boolean,
): Promise<Articulo> {
  const response = await fetch(
    `${API_URL}/${articuloId}/archivado`,
    {
      method: "PATCH",
      headers: obtenerHeadersAutenticados(),
      body: JSON.stringify({ archivado }),
    },
  );

  return leerRespuestaArticulo(
    response,
    archivado
      ? "No se pudo archivar la publicación"
      : "No se pudo desarchivar la publicación",
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
      headers: {
        Authorization: `Bearer ${obtenerToken()}`,
      },
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
      headers: obtenerHeadersAutenticados(),
      body: JSON.stringify({ urlImagen }),
    },
  );

  return leerRespuestaArticulo(
    response,
    "No se pudo eliminar la imagen",
  );
}