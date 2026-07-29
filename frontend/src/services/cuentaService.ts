
import {
  solicitarApi,
} from "./apiService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

const API_URL =
  `${API_BASE_URL}/cuenta`;

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

export async function obtenerPerfil(): Promise<
  PerfilUsuario
> {
  const respuesta =
    await solicitarApi<RespuestaPerfil>(
      `${API_URL}/perfil`,
      {
        method: "GET",
      },
      true,
    );

  if (
    !respuesta.ok ||
    !respuesta.perfil
  ) {
    throw new Error(
      respuesta.message ??
        "El servidor no devolvió los datos del perfil",
    );
  }

  return respuesta.perfil;
}

export async function actualizarPerfil(
  datos: ActualizarPerfilDatos,
): Promise<PerfilUsuario> {
  const respuesta =
    await solicitarApi<RespuestaPerfil>(
      `${API_URL}/perfil`,
      {
        method: "PUT",
        body: JSON.stringify(datos),
      },
      true,
    );

  if (
    !respuesta.ok ||
    !respuesta.perfil
  ) {
    throw new Error(
      respuesta.message ??
        "El servidor no devolvió el perfil actualizado",
    );
  }

  return respuesta.perfil;
}

export async function cambiarContrasena(
  datos: CambiarContrasenaDatos,
): Promise<void> {
  const respuesta =
    await solicitarApi<RespuestaGenerica>(
      `${API_URL}/contrasena`,
      {
        method: "PATCH",
        body: JSON.stringify(datos),
      },
      true,
    );

  if (!respuesta.ok) {
    throw new Error(
      respuesta.message ??
        "No se pudo actualizar la contraseña",
    );
  }
}