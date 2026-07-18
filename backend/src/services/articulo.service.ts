import type { Articulo } from "../models/articulo.model.js";
import { buscarArticulosEnBaseDeDatos } from "../repositories/articulo.repository.js";

export async function buscarArticulos(
  termino: string | undefined,
  categoriaId: string | undefined,
): Promise<Articulo[]> {
  const terminoLimpio = termino?.trim() ?? "";

  let categoriaConvertida: number | null = null;

  if (categoriaId) {
    const numeroCategoria = Number(categoriaId);

    if (!Number.isInteger(numeroCategoria) || numeroCategoria < 1) {
      throw new Error("La categoría proporcionada no es válida");
    }

    categoriaConvertida = numeroCategoria;
  }

  return buscarArticulosEnBaseDeDatos(
    terminoLimpio,
    categoriaConvertida,
  );
}