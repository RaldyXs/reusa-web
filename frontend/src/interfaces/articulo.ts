export interface Articulo {
  articulo_id: number;
  titulo: string;
  descripcion: string | null;
  precio: string;
  condicion: "nuevo" | "reparado" | "usado";
  ubicacion: string | null;
  estado: "activo" | "vendido" | "archivado";
  fecha_publicacion: string;

  categoria_id: number;
  categoria: string;

  vendedor_id: number;
  vendedor: string;

  imagen_principal: string | null;
}

export interface RespuestaArticulos {
  ok: boolean;
  total: number;
  articulos: Articulo[];
}