import type {
  RegistroUsuarioDatos,
  RegistroUsuarioRespuesta,
  Sesion,
  UsuarioSesion,
} from "../interfaces/auth";

const API_URL = "http://localhost:3000/api/auth";

interface LoginResponse {
  ok: boolean;
  message?: string;
  token?: string;
  usuario?: UsuarioSesion;
}

export async function iniciarSesion(
  email: string,
  contrasena: string,
): Promise<Sesion> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      contrasena,
    }),
  });

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

  return {
    token: resultado.token,
    usuario: resultado.usuario,
  };
}

export async function registrarUsuario(
  datos: RegistroUsuarioDatos,
): Promise<UsuarioSesion> {
  const response = await fetch(
    `${API_URL}/registro`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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