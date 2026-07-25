import type {
  Categoria,
} from "../models/categoria.model.ts";

import {
  obtenerCategoriasDesdeBaseDeDatos,
} from "../repositories/categoria.repository.js";

export async function listarCategorias(): Promise<
  Categoria[]
> {
  return obtenerCategoriasDesdeBaseDeDatos();
}