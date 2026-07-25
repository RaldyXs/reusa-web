export type RolUsuario =
  | "usuario"
  | "administrador";

export interface UsuarioSesion {
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
}

export interface Sesion {
  token: string;
  usuario: UsuarioSesion;
}

export interface RegistroUsuarioDatos {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  confirmarContrasena: string;
  telefono: string;
  ubicacion: string;
}

export interface RegistroUsuarioRespuesta {
  ok: boolean;
  message: string;
  usuario?: UsuarioSesion;
}