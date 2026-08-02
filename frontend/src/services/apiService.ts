import {
  manejarSesionExpirada,
  obtenerSesionGuardada,
} from "./authService";

interface RespuestaError {
  ok?: boolean;
  message?: string;
}

export async function solicitarApi<T>(
  url: string,
  opciones: RequestInit = {},
  requiereAutenticacion = false,
): Promise<T> {
  const headers = new Headers(
    opciones.headers,
  );

  const cuerpoEsFormData =
    opciones.body instanceof FormData;

  if (
    opciones.body !== undefined &&
    !cuerpoEsFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (requiereAutenticacion) {
    const sesion =
      obtenerSesionGuardada();

    if (!sesion) {
      manejarSesionExpirada();

      throw new Error(
        "Debes iniciar sesión",
      );
    }

    headers.set(
      "Authorization",
      `Bearer ${sesion.token}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...opciones,
      headers,
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor",
    );
  }

  let datos: unknown;

  try {
    datos = await response.json();
  } catch {
    datos = {
      ok: false,
      message:
        "El servidor devolvió una respuesta no válida",
    };
  }

  if (response.status === 401) {
    manejarSesionExpirada();

    throw new Error(
      "La sesión expiró",
    );
  }

  if (!response.ok) {
    const error =
      datos as RespuestaError;

    throw new Error(
      error.message ??
        "No se pudo completar la solicitud",
    );
  }

  return datos as T;
}