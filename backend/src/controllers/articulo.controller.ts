import type { Request, Response } from "express";
import { buscarArticulos } from "../services/articulo.service.js";

export async function obtenerArticulos(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const termino =
      typeof request.query.termino === "string"
        ? request.query.termino
        : undefined;

    const categoriaId =
      typeof request.query.categoriaId === "string"
        ? request.query.categoriaId
        : undefined;

    const articulos = await buscarArticulos(
      termino,
      categoriaId,
    );

    response.status(200).json({
      ok: true,
      total: articulos.length,
      articulos,
    });
  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : "Ocurrió un error desconocido";

    response.status(400).json({
      ok: false,
      message: mensaje,
    });
  }
}