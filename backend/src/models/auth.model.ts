import type { RowDataPacket } from "mysql2";

export type RolUsuario =
  | "usuario"
  | "administrador";

export interface UsuarioAutenticacion
  extends RowDataPacket {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  telefono: string | null;
  ubicacion: string | null;
  rol: RolUsuario;
  activo: number;
}

export interface UsuarioSesion {
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
}