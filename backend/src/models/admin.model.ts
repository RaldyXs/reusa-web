import type {
  RowDataPacket,
} from "mysql2";

import type {
  RolUsuario,
} from "./auth.model.js";

export interface ResumenAdministracion
  extends RowDataPacket {
  total_usuarios: number;
  usuarios_activos: number;
  total_publicaciones: number;
  publicaciones_activas: number;
  publicaciones_vendidas: number;
  publicaciones_archivadas: number;
  total_categorias: number;
}

export interface UsuarioAdministracion
  extends RowDataPacket {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  ubicacion: string | null;
  rol: RolUsuario;
  activo: number;
  fecha_registro: Date;
}

export interface PublicacionAdministracion
  extends RowDataPacket {
  articulo_id: number;
  titulo: string;
  precio: number;
  condicion:
    | "nuevo"
    | "reparado"
    | "usado";
  estado:
    | "activo"
    | "vendido"
    | "archivado";
  archivado: number;
  fecha_publicacion: Date;
  categoria: string;
  vendedor_id: number;
  vendedor_nombre: string;
  vendedor_email: string;
}

export interface EstadisticaMensualAdministracion
  extends RowDataPacket {
  periodo: string;
  anio: number;
  mes: number;
  total: number;
}

export interface EstadisticaEstadoPublicacion
  extends RowDataPacket {
  estado:
    | "activo"
    | "vendido"
    | "archivado";
  total: number;
}

export interface EstadisticaCategoriaAdministracion
  extends RowDataPacket {
  categoria_id: number;
  categoria: string;
  total: number;
}

export interface EstadisticasDashboardAdministracion {
  usuarios_por_mes:
    EstadisticaMensualAdministracion[];

  publicaciones_por_mes:
    EstadisticaMensualAdministracion[];

  publicaciones_por_estado:
    EstadisticaEstadoPublicacion[];

  publicaciones_por_categoria:
    EstadisticaCategoriaAdministracion[];
}