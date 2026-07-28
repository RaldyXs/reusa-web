import type {
  RolUsuario,
  Sesion,
} from "../interfaces/auth";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

const CLAVE_SESION = "reusa_sesion";

export type EstadoPublicacionAdministracion =
  | "activo"
  | "vendido"
  | "archivado";

export interface ResumenAdministracion {
  total_usuarios: number;
  usuarios_activos: number;
  total_publicaciones: number;
  publicaciones_activas: number;
  publicaciones_vendidas: number;
  publicaciones_archivadas: number;
  total_categorias: number;
}

export interface UsuarioAdministracion {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  ubicacion: string | null;
  rol: RolUsuario;
  activo: number;
  fecha_registro: string;
}

export interface PublicacionAdministracion {
  articulo_id: number;
  titulo: string;
  precio: number;
  condicion:
    | "nuevo"
    | "reparado"
    | "usado";
  estado: EstadoPublicacionAdministracion;
  archivado: number;
  fecha_publicacion: string;
  categoria: string;
  vendedor_id: number;
  vendedor_nombre: string;
  vendedor_email: string;
}

export interface CategoriaAdministracion {
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  activo: number;
  fecha_creacion: string;
}

export interface DatosCategoriaAdministracion {
  nombre: string;
  descripcion: string;
}

interface RespuestaResumen {
  ok: boolean;
  resumen?: ResumenAdministracion;
  message?: string;
}

interface RespuestaUsuarios {
  ok: boolean;
  usuarios?: UsuarioAdministracion[];
  message?: string;
}

interface RespuestaEstadoUsuario {
  ok: boolean;
  message?: string;
  usuario?: UsuarioAdministracion;
}

interface RespuestaPublicaciones {
  ok: boolean;
  publicaciones?: PublicacionAdministracion[];
  message?: string;
}

interface RespuestaEstadoPublicacion {
  ok: boolean;
  message?: string;
  publicacion?: PublicacionAdministracion;
}

interface RespuestaCategorias {
  ok: boolean;
  categorias?: CategoriaAdministracion[];
  message?: string;
}

interface RespuestaCategoria {
  ok: boolean;
  categoria?: CategoriaAdministracion;
  message?: string;
}

interface OpcionesSolicitud {
  method?:
    | "GET"
    | "POST"
    | "PATCH"
    | "PUT"
    | "DELETE";
  body?: unknown;
}

function obtenerToken(): string {
  const sesionGuardada =
    localStorage.getItem(CLAVE_SESION);

  if (!sesionGuardada) {
    throw new Error(
      "Debes iniciar sesión como administrador",
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

async function solicitarAdministracion<T>(
  ruta: string,
  opciones: OpcionesSolicitud = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization:
      `Bearer ${obtenerToken()}`,
  };

  if (opciones.body !== undefined) {
    headers["Content-Type"] =
      "application/json";
  }

  const response = await fetch(
    `${API_URL}/admin/${ruta}`,
    {
      method: opciones.method ?? "GET",
      headers,
      body:
        opciones.body !== undefined
          ? JSON.stringify(opciones.body)
          : undefined,
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

export async function obtenerResumenAdmin(): Promise<
  ResumenAdministracion
> {
  const respuesta =
    await solicitarAdministracion<RespuestaResumen>(
      "resumen",
    );

  if (!respuesta.resumen) {
    throw new Error(
      "El servidor no devolvió el resumen administrativo",
    );
  }

  return respuesta.resumen;
}

export async function obtenerUsuariosAdmin(): Promise<
  UsuarioAdministracion[]
> {
  const respuesta =
    await solicitarAdministracion<RespuestaUsuarios>(
      "usuarios",
    );

  return Array.isArray(respuesta.usuarios)
    ? respuesta.usuarios
    : [];
}

export async function cambiarEstadoUsuarioAdmin(
  usuarioId: number,
  activo: boolean,
): Promise<UsuarioAdministracion> {
  const respuesta =
    await solicitarAdministracion<RespuestaEstadoUsuario>(
      `usuarios/${usuarioId}/estado`,
      {
        method: "PATCH",
        body: {
          activo,
        },
      },
    );

  if (!respuesta.usuario) {
    throw new Error(
      "El servidor no devolvió el usuario actualizado",
    );
  }

  return respuesta.usuario;
}

export async function obtenerPublicacionesAdmin(): Promise<
  PublicacionAdministracion[]
> {
  const respuesta =
    await solicitarAdministracion<RespuestaPublicaciones>(
      "publicaciones",
    );

  return Array.isArray(
    respuesta.publicaciones,
  )
    ? respuesta.publicaciones
    : [];
}

export async function cambiarEstadoPublicacionAdmin(
  articuloId: number,
  estado: EstadoPublicacionAdministracion,
): Promise<PublicacionAdministracion> {
  const respuesta =
    await solicitarAdministracion<RespuestaEstadoPublicacion>(
      `publicaciones/${articuloId}/estado`,
      {
        method: "PATCH",
        body: {
          estado,
        },
      },
    );

  if (!respuesta.publicacion) {
    throw new Error(
      "El servidor no devolvió la publicación actualizada",
    );
  }

  return respuesta.publicacion;
}

export async function obtenerCategoriasAdmin(): Promise<
  CategoriaAdministracion[]
> {
  const respuesta =
    await solicitarAdministracion<RespuestaCategorias>(
      "categorias",
    );

  return Array.isArray(respuesta.categorias)
    ? respuesta.categorias
    : [];
}

export async function crearCategoriaAdmin(
  datos: DatosCategoriaAdministracion,
): Promise<CategoriaAdministracion> {
  const respuesta =
    await solicitarAdministracion<RespuestaCategoria>(
      "categorias",
      {
        method: "POST",
        body: datos,
      },
    );

  if (!respuesta.categoria) {
    throw new Error(
      "El servidor no devolvió la categoría creada",
    );
  }

  return respuesta.categoria;
}

export async function actualizarCategoriaAdmin(
  categoriaId: number,
  datos: DatosCategoriaAdministracion,
): Promise<CategoriaAdministracion> {
  const respuesta =
    await solicitarAdministracion<RespuestaCategoria>(
      `categorias/${categoriaId}`,
      {
        method: "PUT",
        body: datos,
      },
    );

  if (!respuesta.categoria) {
    throw new Error(
      "El servidor no devolvió la categoría actualizada",
    );
  }

  return respuesta.categoria;
}

export async function cambiarEstadoCategoriaAdmin(
  categoriaId: number,
  activo: boolean,
): Promise<CategoriaAdministracion> {
  const respuesta =
    await solicitarAdministracion<RespuestaCategoria>(
      `categorias/${categoriaId}/estado`,
      {
        method: "PATCH",
        body: {
          activo,
        },
      },
    );

  if (!respuesta.categoria) {
    throw new Error(
      "El servidor no devolvió la categoría actualizada",
    );
  }

  return respuesta.categoria;
}