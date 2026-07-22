export interface Articulo {
  articulo_id: number;
  titulo: string;
  descripcion?: string | null;
  precio: number | string;
  condicion: "nuevo" | "usado" | "reparado";

  categoria: string;
  categoria_id?: number;

  ubicacion?: string | null;
  imagen_principal?: string | null;
  imagenes?: string[];

  vendedor?: string | null;
  vendedor_id?: number;
  usuario_id?: number;

  estado?: "activo" | "vendido" | "archivado";
  fecha_publicacion?: string | null;
}