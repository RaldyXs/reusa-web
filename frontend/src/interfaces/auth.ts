export type RolUsuario =
  | "comprador"
  | "vendedor"
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