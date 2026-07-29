import type {
  RegistroUsuarioDatos,
  RegistroUsuarioRespuesta,
  Sesion,
  UsuarioSesion,
} from "../interfaces/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

const API_URL =
  `${API_BASE_URL}/auth`;

export const CLAVE_SESION =
  "reusa_sesion";

interface LoginResponse {
  ok: boolean;
  message?: string;
  token?: string;
  usuario?: UsuarioSesion;
}

export function guardarSesion(
  sesion: Sesion,
): void {
  localStorage.setItem(
    CLAVE_SESION,
    JSON.stringify(sesion),
  );
}

export function obtenerSesionGuardada():
  | Sesion
  | null {
  const sesionGuardada =
    localStorage.getItem(CLAVE_SESION);

  if (!sesionGuardada) {
    return null;
  }

  try {
    const sesion =
      JSON.parse(
        sesionGuardada,
      ) as Sesion;

    if (
      !sesion.token ||
      !sesion.usuario
    ) {
      cerrarSesion();
      return null;
    }

    return sesion;
  } catch {
    cerrarSesion();
    return null;
  }
}

export function actualizarUsuarioSesion(
  datos: {
    nombre: string;
    apellido: string;
  },
): void {
  const sesion =
    obtenerSesionGuardada();

  if (!sesion) {
    return;
  }

  const sesionActualizada: Sesion = {
    ...sesion,
    usuario: {
      ...sesion.usuario,
      nombre: datos.nombre,
      apellido: datos.apellido,
    },
  };

  guardarSesion(
    sesionActualizada,
  );

  window.dispatchEvent(
    new CustomEvent(
      "reusa-sesion-actualizada",
      {
        detail:
          sesionActualizada.usuario,
      },
    ),
  );
}

export function cerrarSesion(): void {
  localStorage.removeItem(
    CLAVE_SESION,
  );
}

export function manejarSesionExpirada(): void {
  cerrarSesion();

  window.location.replace(
    "/login?sesion=expirada",
  );
}

export async function iniciarSesion(
  email: string,
  contrasena: string,
): Promise<Sesion> {
  cerrarSesion();

  const response = await fetch(
    `${API_URL}/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        contrasena,
      }),
    },
  );

  const resultado =
    (await response.json()) as LoginResponse;

  if (
    !response.ok ||
    !resultado.ok ||
    !resultado.token ||
    !resultado.usuario
  ) {
    throw new Error(
      resultado.message ??
        "No se pudo iniciar sesión",
    );
  }

  const sesion: Sesion = {
    token: resultado.token,
    usuario: resultado.usuario,
  };

  guardarSesion(sesion);

  return sesion;
}

export async function registrarUsuario(
  datos: RegistroUsuarioDatos,
): Promise<UsuarioSesion> {
  const response = await fetch(
    `${API_URL}/registro`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(datos),
    },
  );

  const resultado =
    (await response.json()) as RegistroUsuarioRespuesta;

  if (
    !response.ok ||
    !resultado.ok ||
    !resultado.usuario
  ) {
    throw new Error(
      resultado.message ??
        "No se pudo registrar el usuario",
    );
  }

  return resultado.usuario;
}