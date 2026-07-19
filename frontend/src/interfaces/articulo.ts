export interface Articulo {
  articulo_id: number;
  titulo: string;
  descripcion?: string | null;
  precio: number | string;
  condicion: string;
  categoria: string;
  categoria_id?: number;
  ubicacion?: string | null;
  imagen_principal?: string | null;
  vendedor?: string | null;
  usuario_id?: number;
  fecha_publicacion?: string | null;
}