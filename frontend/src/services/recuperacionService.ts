const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

interface RespuestaApi {
  ok: boolean;
  message?: string;
}

async function procesarRespuesta(
  response: Response,
): Promise<string> {
  const datos =
    (await response.json()) as RespuestaApi;

  if (!response.ok || !datos.ok) {
    throw new Error(
      datos.message ??
        "No se pudo completar la solicitud",
    );
  }

  return datos.message ?? "Operación completada";
}

export async function solicitarRecuperacion(
  email: string,
): Promise<string> {
  const response = await fetch(
    `${API_URL}/auth/recuperar-contrasena`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    },
  );

  return procesarRespuesta(response);
}

export async function restablecerContrasena(
  token: string,
  contrasena: string,
  confirmarContrasena: string,
): Promise<string> {
  const response = await fetch(
    `${API_URL}/auth/restablecer-contrasena`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        token,
        contrasena,
        confirmarContrasena,
      }),
    },
  );

  return procesarRespuesta(response);
}