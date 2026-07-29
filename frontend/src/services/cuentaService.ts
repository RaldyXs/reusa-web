import type {
  Sesion,
} from "../interfaces/auth";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

const CLAVE_SESION = "reusa_sesion";

export interface PerfilUsuario {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  ubicacion: string | null;
  rol: "usuario" | "administrador";
  activo: number;
  fecha_registro: string;
}

export interface ActualizarPerfilDatos {
  nombre: string;
  apellido: string;
  telefono: string;
  ubicacion: string;
}

export interface CambiarContrasenaDatos {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

interface RespuestaPerfil {
  ok: boolean;
  message?: string;
  perfil?: PerfilUsuario;
}

interface RespuestaGenerica {
  ok: boolean;
  message?: string;
}

function obtenerToken(): string {
  const sesionGuardada =
    localStorage.getItem(CLAVE_SESION);

  if (!sesionGuardada) {
    throw new Error(
      "Debes iniciar sesión para acceder a tu cuenta",
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
    throw new Error(
      "La sesión guardada no es válida",
    );
  }
}

async function solicitarCuenta<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  const headers = new Headers(
    opciones.headers,
  );

  headers.set(
    "Authorization",
    `Bearer ${obtenerToken()}`,
  );

  if (
    opciones.body !== undefined &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(
    `${API_URL}/cuenta${ruta}`,
    {
      ...opciones,
      headers,
    },
  );

  const datos = (await response.json()) as {
    ok: boolean;
    message?: string;
  };

  if (!response.ok || !datos.ok) {
    throw new Error(
      datos.message ??
        "No se pudo completar la solicitud",
    );
  }

  return datos as T;
}

export async function obtenerPerfil(): Promise<
  PerfilUsuario
> {
  const respuesta =
    await solicitarCuenta<RespuestaPerfil>(
      "/perfil",
    );

  if (!respuesta.perfil) {
    throw new Error(
      "El servidor no devolvió los datos del perfil",
    );
  }

  return respuesta.perfil;
}

export async function actualizarPerfil(
  datos: ActualizarPerfilDatos,
): Promise<PerfilUsuario> {
  const respuesta =
    await solicitarCuenta<RespuestaPerfil>(
      "/perfil",
      {
        method: "PUT",
        body: JSON.stringify(datos),
      },
    );

  if (!respuesta.perfil) {
    throw new Error(
      "El servidor no devolvió el perfil actualizado",
    );
  }

  return respuesta.perfil;
}

export async function cambiarContrasena(
  datos: CambiarContrasenaDatos,
): Promise<void> {
  await solicitarCuenta<RespuestaGenerica>(
    "/contrasena",
    {
      method: "PATCH",
      body: JSON.stringify(datos),
    },
  );
}