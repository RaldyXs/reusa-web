import fs from "node:fs/promises";
import path from "node:path";

import type { Request, Response } from "express";

import {
  actualizarArticulo,
  actualizarEstadoArticulo,
  buscarArticulos,
  crearArticulo,
  obtenerArticuloPorId,
} from "../services/articulo.service.js";

import {
  contarImagenesArticulo,
  eliminarImagenArticuloEnBaseDeDatos,
  guardarImagenesArticuloEnBaseDeDatos,
} from "../repositories/articulo.repository.js";

function obtenerMensajeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error desconocido";
}

function convertirArticuloId(
  valor: string | undefined,
): number {
  const articuloId = Number(valor);

  if (
    !Number.isInteger(articuloId) ||
    articuloId < 1
  ) {
    throw new Error(
      "El identificador del artículo no es válido",
    );
  }

  return articuloId;
}

async function eliminarArchivos(
  archivos: Express.Multer.File[],
): Promise<void> {
  await Promise.allSettled(
    archivos.map((archivo) =>
      fs.unlink(archivo.path),
    ),
  );
}

async function eliminarArchivoDesdeUrl(
  urlImagen: string,
): Promise<void> {
  try {
    const url = new URL(urlImagen);
    const nombreArchivo = path.basename(url.pathname);

    const rutaArchivo = path.resolve(
      process.cwd(),
      "uploads",
      "articulos",
      nombreArchivo,
    );

    await fs.unlink(rutaArchivo);
  } catch (error) {
    const codigo =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? String(error.code)
        : "";

    if (codigo !== "ENOENT") {
      console.error(
        "No se pudo eliminar el archivo de imagen:",
        error,
      );
    }
  }
}

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
    response.status(400).json({
      ok: false,
      message: obtenerMensajeError(error),
    });
  }
}

export async function obtenerArticulo(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const id =
      typeof request.params.id === "string"
        ? request.params.id
        : undefined;

    if (!id) {
      response.status(400).json({
        ok: false,
        message: "ID de artículo inválido",
      });

      return;
    }

    const articulo = await obtenerArticuloPorId(id);

    if (!articulo) {
      response.status(404).json({
        ok: false,
        message:
          "El artículo solicitado no existe",
      });

      return;
    }

    response.status(200).json({
      ok: true,
      articulo,
    });
  } catch (error) {
    response.status(400).json({
      ok: false,
      message: obtenerMensajeError(error),
    });
  }
}

export async function publicarArticulo(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const articulo = await crearArticulo(
      request.body,
    );

    response.status(201).json({
      ok: true,
      message:
        "Artículo publicado correctamente",
      articulo,
    });
  } catch (error) {
    response.status(400).json({
      ok: false,
      message: obtenerMensajeError(error),
    });
  }
}

export async function editarArticulo(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const id =
      typeof request.params.id === "string"
        ? request.params.id
        : undefined;

    if (!id) {
      response.status(400).json({
        ok: false,
        message: "ID de artículo inválido",
      });

      return;
    }

    const articulo = await actualizarArticulo(
      id,
      request.body,
    );

    response.status(200).json({
      ok: true,
      message:
        "Artículo actualizado correctamente",
      articulo,
    });
  } catch (error) {
    const mensaje = obtenerMensajeError(error);

    const estadoHttp =
      mensaje === "El artículo no existe"
        ? 404
        : 400;

    response.status(estadoHttp).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function cambiarEstadoArticulo(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const id =
      typeof request.params.id === "string"
        ? request.params.id
        : undefined;

    if (!id) {
      response.status(400).json({
        ok: false,
        message: "ID de artículo inválido",
      });

      return;
    }

    const articulo =
      await actualizarEstadoArticulo(
        id,
        request.body,
      );

    response.status(200).json({
      ok: true,
      message:
        "Estado actualizado correctamente",
      articulo,
    });
  } catch (error) {
    const mensaje = obtenerMensajeError(error);

    const estadoHttp =
      mensaje === "El artículo no existe"
        ? 404
        : 400;

    response.status(estadoHttp).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function guardarImagenesArticulo(
  request: Request,
  response: Response,
): Promise<void> {
  const archivos =
    (request.files as Express.Multer.File[]) ??
    [];

  try {
    const id =
      typeof request.params.id === "string"
        ? request.params.id
        : undefined;

    const articuloId = convertirArticuloId(id);

    const articulo =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    if (!articulo) {
      await eliminarArchivos(archivos);

      response.status(404).json({
        ok: false,
        message: "El artículo no existe",
      });

      return;
    }

    if (archivos.length === 0) {
      response.status(400).json({
        ok: false,
        message:
          "Debes seleccionar al menos una imagen",
      });

      return;
    }

    const cantidadActual =
      await contarImagenesArticulo(articuloId);

    if (
      cantidadActual + archivos.length >
      5
    ) {
      await eliminarArchivos(archivos);

      response.status(400).json({
        ok: false,
        message:
          "El artículo no puede tener más de cinco imágenes",
      });

      return;
    }

    const baseUrl =
      `${request.protocol}://${request.get("host")}`;

    const imagenes = archivos.map(
      (archivo, indice) => ({
        urlImagen:
          `${baseUrl}/uploads/articulos/${archivo.filename}`,
        esPrincipal:
          cantidadActual === 0 && indice === 0,
        orden: cantidadActual + indice,
      }),
    );

    await guardarImagenesArticuloEnBaseDeDatos(
      articuloId,
      imagenes,
    );

    const articuloActualizado =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    response.status(201).json({
      ok: true,
      message:
        "Imágenes guardadas correctamente",
      imagenes: imagenes.map(
        (imagen) => imagen.urlImagen,
      ),
      articulo: articuloActualizado,
    });
  } catch (error) {
    await eliminarArchivos(archivos);

    response.status(400).json({
      ok: false,
      message: obtenerMensajeError(error),
    });
  }
}

export async function eliminarImagenArticulo(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const id =
      typeof request.params.id === "string"
        ? request.params.id
        : undefined;

    const articuloId = convertirArticuloId(id);

    const urlImagen =
      typeof request.body.urlImagen === "string"
        ? request.body.urlImagen.trim()
        : "";

    if (!urlImagen) {
      response.status(400).json({
        ok: false,
        message:
          "Debes indicar la imagen que deseas eliminar",
      });

      return;
    }

    const articulo =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    if (!articulo) {
      response.status(404).json({
        ok: false,
        message: "El artículo no existe",
      });

      return;
    }

    const eliminada =
      await eliminarImagenArticuloEnBaseDeDatos(
        articuloId,
        urlImagen,
      );

    if (!eliminada) {
      response.status(404).json({
        ok: false,
        message:
          "La imagen indicada no pertenece al artículo",
      });

      return;
    }

    await eliminarArchivoDesdeUrl(urlImagen);

    const articuloActualizado =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    response.status(200).json({
      ok: true,
      message:
        "Imagen eliminada correctamente",
      articulo: articuloActualizado,
    });
  } catch (error) {
    response.status(400).json({
      ok: false,
      message: obtenerMensajeError(error),
    });
  }
}