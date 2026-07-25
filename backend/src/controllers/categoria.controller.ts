import type {
  Request,
  Response,
} from "express";

import {
  listarCategorias,
} from "../services/categoria.service.js";

export async function obtenerCategorias(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const categorias =
      await listarCategorias();

    response.status(200).json({
      ok: true,
      categorias,
    });
  } catch (errorDesconocido) {
    console.error(
      "Error al obtener las categorías:",
      errorDesconocido,
    );

    response.status(500).json({
      ok: false,
      message:
        "No se pudieron obtener las categorías",
    });
  }
}