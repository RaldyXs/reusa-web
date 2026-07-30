import fs from "node:fs/promises";
import path from "node:path";

import type {
  Request,
  Response,
} from "express";

import type {
  RequestAutenticado,
} from "../middlewares/auth.middleware.js";

import {
  actualizarArchivadoArticulo,
  actualizarArticulo,
  actualizarEstadoArticulo,
  buscarArticulos,
  crearArticulo,
  eliminarArticulo,
  obtenerArticuloPorId,
  obtenerMisArticulos,
} from "../services/articulo.service.js";

import {
  contarImagenesArticulo,
  eliminarImagenArticuloEnBaseDeDatos,
  guardarImagenesArticuloEnBaseDeDatos,
} from "../repositories/articulo.repository.js";

function obtenerMensajeError(
  error: unknown,
): string {
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

function usuarioPuedeGestionarArticulo(
  request: RequestAutenticado,
  vendedorId: number,
): boolean {
  if (!request.usuario) {
    return false;
  }

  if (
    request.usuario.rol ===
    "administrador"
  ) {
    return true;
  }

  return (
    Number(
      request.usuario.usuarioId,
    ) === Number(vendedorId)
  );
}

async function eliminarArchivos(
  archivos: Express.Multer.File[],
): Promise<void> {
  await Promise.allSettled(
    archivos.map(
      (archivo) =>
        fs.unlink(archivo.path),
    ),
  );
}

async function eliminarArchivoDesdeUrl(
  urlImagen: string,
): Promise<void> {
  try {
    const url = new URL(
      urlImagen,
    );

    const nombreArchivo =
      path.basename(
        url.pathname,
      );

    const rutaArchivo =
      path.resolve(
        process.cwd(),
        "uploads",
        "articulos",
        nombreArchivo,
      );

    await fs.unlink(
      rutaArchivo,
    );
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
      typeof request.query.termino ===
      "string"
        ? request.query.termino
        : undefined;

    const categoriaId =
      typeof request.query
        .categoriaId === "string"
        ? request.query.categoriaId
        : undefined;

    const articulos =
      await buscarArticulos(
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
      message:
        obtenerMensajeError(
          error,
        ),
    });
  }
}

export async function obtenerMisPublicaciones(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    if (!request.usuario) {
      response.status(401).json({
        ok: false,
        message:
          "Debes iniciar sesión para ver tus publicaciones",
      });

      return;
    }

    const articulos =
      await obtenerMisArticulos(
        request.usuario.usuarioId,
      );

    response.status(200).json({
      ok: true,
      total: articulos.length,
      articulos,
    });
  } catch (error) {
    response.status(400).json({
      ok: false,
      message:
        obtenerMensajeError(
          error,
        ),
    });
  }
}

export async function obtenerArticulo(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const id =
      typeof request.params.id ===
      "string"
        ? request.params.id
        : undefined;

    if (!id) {
      response.status(400).json({
        ok: false,
        message:
          "ID de artículo inválido",
      });

      return;
    }

    const articulo =
      await obtenerArticuloPorId(
        id,
      );

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
      message:
        obtenerMensajeError(
          error,
        ),
    });
  }
}

export async function publicarArticulo(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    if (!request.usuario) {
      response.status(401).json({
        ok: false,
        message:
          "Debes iniciar sesión para publicar",
      });

      return;
    }

    const articulo =
      await crearArticulo({
        ...request.body,
        vendedorId:
          request.usuario.usuarioId,
      });

    response.status(201).json({
      ok: true,
      message:
        "Artículo publicado correctamente",
      articulo,
    });
  } catch (error) {
    response.status(400).json({
      ok: false,
      message:
        obtenerMensajeError(
          error,
        ),
    });
  }
}

export async function editarArticulo(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    if (!request.usuario) {
      response.status(401).json({
        ok: false,
        message:
          "Debes iniciar sesión para editar",
      });

      return;
    }

    const id =
      typeof request.params.id ===
      "string"
        ? request.params.id
        : undefined;

    const articuloId =
      convertirArticuloId(
        id,
      );

    const articuloExistente =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    if (!articuloExistente) {
      response.status(404).json({
        ok: false,
        message:
          "El artículo no existe",
      });

      return;
    }

    if (
      !usuarioPuedeGestionarArticulo(
        request,
        articuloExistente.vendedor_id,
      )
    ) {
      response.status(403).json({
        ok: false,
        message:
          "No tienes permiso para editar esta publicación",
      });

      return;
    }

    const articuloActualizado =
      await actualizarArticulo(
        String(articuloId),
        request.body,
      );

    response.status(200).json({
      ok: true,
      message:
        "Artículo actualizado correctamente",
      articulo:
        articuloActualizado,
    });
  } catch (error) {
    const mensaje =
      obtenerMensajeError(
        error,
      );

    const estadoHttp =
      mensaje ===
      "El artículo no existe"
        ? 404
        : 400;

    response
      .status(estadoHttp)
      .json({
        ok: false,
        message: mensaje,
      });
  }
}

export async function cambiarEstadoArticulo(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    if (!request.usuario) {
      response.status(401).json({
        ok: false,
        message:
          "Debes iniciar sesión para cambiar el estado",
      });

      return;
    }

    const id =
      typeof request.params.id ===
      "string"
        ? request.params.id
        : undefined;

    const articuloId =
      convertirArticuloId(
        id,
      );

    const articuloExistente =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    if (!articuloExistente) {
      response.status(404).json({
        ok: false,
        message:
          "El artículo no existe",
      });

      return;
    }

    if (
      !usuarioPuedeGestionarArticulo(
        request,
        articuloExistente.vendedor_id,
      )
    ) {
      response.status(403).json({
        ok: false,
        message:
          "No tienes permiso para cambiar el estado de esta publicación",
      });

      return;
    }

    const articuloActualizado =
      await actualizarEstadoArticulo(
        String(articuloId),
        request.body,
      );

    response.status(200).json({
      ok: true,
      message:
        "Estado actualizado correctamente",
      articulo:
        articuloActualizado,
    });
  } catch (error) {
    const mensaje =
      obtenerMensajeError(
        error,
      );

    const estadoHttp =
      mensaje ===
      "El artículo no existe"
        ? 404
        : 400;

    response
      .status(estadoHttp)
      .json({
        ok: false,
        message: mensaje,
      });
  }
}

export async function cambiarArchivadoArticulo(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    if (!request.usuario) {
      response.status(401).json({
        ok: false,
        message:
          "Debes iniciar sesión para archivar publicaciones",
      });

      return;
    }

    const id =
      typeof request.params.id ===
      "string"
        ? request.params.id
        : undefined;

    const articuloId =
      convertirArticuloId(
        id,
      );

    const articuloExistente =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    if (!articuloExistente) {
      response.status(404).json({
        ok: false,
        message:
          "El artículo no existe",
      });

      return;
    }

    if (
      !usuarioPuedeGestionarArticulo(
        request,
        articuloExistente.vendedor_id,
      )
    ) {
      response.status(403).json({
        ok: false,
        message:
          "No tienes permiso para archivar esta publicación",
      });

      return;
    }

    const articuloActualizado =
      await actualizarArchivadoArticulo(
        String(articuloId),
        request.body,
      );

    const estaArchivado =
      Number(
        articuloActualizado.archivado,
      ) === 1;

    response.status(200).json({
      ok: true,
      message: estaArchivado
        ? "Publicación archivada correctamente"
        : "Publicación desarchivada correctamente",
      articulo:
        articuloActualizado,
    });
  } catch (error) {
    const mensaje =
      obtenerMensajeError(
        error,
      );

    const estadoHttp =
      mensaje ===
      "El artículo no existe"
        ? 404
        : 400;

    response
      .status(estadoHttp)
      .json({
        ok: false,
        message: mensaje,
      });
  }
}

export async function eliminarPublicacion(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    if (!request.usuario) {
      response.status(401).json({
        ok: false,
        message:
          "Debes iniciar sesión para eliminar publicaciones",
      });

      return;
    }

    const id =
      typeof request.params.id ===
      "string"
        ? request.params.id
        : undefined;

    const articuloId =
      convertirArticuloId(
        id,
      );

    const articuloExistente =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    if (!articuloExistente) {
      response.status(404).json({
        ok: false,
        message:
          "El artículo no existe o ya fue eliminado",
      });

      return;
    }

    const usuarioId = Number(
      request.usuario.usuarioId,
    );

    if (
      Number(
        articuloExistente.vendedor_id,
      ) !== usuarioId
    ) {
      response.status(403).json({
        ok: false,
        message:
          "No tienes permiso para eliminar esta publicación",
      });

      return;
    }

    await eliminarArticulo(
      String(articuloId),
      usuarioId,
    );

    response.status(200).json({
      ok: true,
      message:
        "Publicación eliminada correctamente",
    });
  } catch (error) {
    const mensaje =
      obtenerMensajeError(
        error,
      );

    let estadoHttp = 400;

    if (
      mensaje.includes(
        "no existe",
      ) ||
      mensaje.includes(
        "ya fue eliminado",
      )
    ) {
      estadoHttp = 404;
    }

    if (
      mensaje.includes(
        "No tienes permiso",
      )
    ) {
      estadoHttp = 403;
    }

    response
      .status(estadoHttp)
      .json({
        ok: false,
        message: mensaje,
      });
  }
}

export async function guardarImagenesArticulo(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  const archivos =
    (request.files as
      Express.Multer.File[]) ??
    [];

  try {
    if (!request.usuario) {
      await eliminarArchivos(
        archivos,
      );

      response.status(401).json({
        ok: false,
        message:
          "Debes iniciar sesión para subir imágenes",
      });

      return;
    }

    const id =
      typeof request.params.id ===
      "string"
        ? request.params.id
        : undefined;

    const articuloId =
      convertirArticuloId(
        id,
      );

    const articuloExistente =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    if (!articuloExistente) {
      await eliminarArchivos(
        archivos,
      );

      response.status(404).json({
        ok: false,
        message:
          "El artículo no existe",
      });

      return;
    }

    if (
      !usuarioPuedeGestionarArticulo(
        request,
        articuloExistente.vendedor_id,
      )
    ) {
      await eliminarArchivos(
        archivos,
      );

      response.status(403).json({
        ok: false,
        message:
          "No tienes permiso para agregar imágenes a esta publicación",
      });

      return;
    }

    if (
      archivos.length === 0
    ) {
      response.status(400).json({
        ok: false,
        message:
          "Debes seleccionar al menos una imagen",
      });

      return;
    }

    const cantidadActual =
      await contarImagenesArticulo(
        articuloId,
      );

    if (
      cantidadActual +
        archivos.length >
      5
    ) {
      await eliminarArchivos(
        archivos,
      );

      response.status(400).json({
        ok: false,
        message:
          "El artículo no puede tener más de cinco imágenes",
      });

      return;
    }

    const baseUrl =
      `${request.protocol}://${request.get(
        "host",
      )}`;

    const imagenes =
      archivos.map(
        (
          archivo,
          indice,
        ) => ({
          urlImagen:
            `${baseUrl}/uploads/articulos/${archivo.filename}`,

          esPrincipal:
            cantidadActual === 0 &&
            indice === 0,

          orden:
            cantidadActual +
            indice,
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

      imagenes:
        imagenes.map(
          (imagen) =>
            imagen.urlImagen,
        ),

      articulo:
        articuloActualizado,
    });
  } catch (error) {
    await eliminarArchivos(
      archivos,
    );

    response.status(400).json({
      ok: false,
      message:
        obtenerMensajeError(
          error,
        ),
    });
  }
}

export async function eliminarImagenArticulo(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    if (!request.usuario) {
      response.status(401).json({
        ok: false,
        message:
          "Debes iniciar sesión para eliminar imágenes",
      });

      return;
    }

    const id =
      typeof request.params.id ===
      "string"
        ? request.params.id
        : undefined;

    const articuloId =
      convertirArticuloId(
        id,
      );

    const urlImagen =
      typeof request.body
        .urlImagen === "string"
        ? request.body
            .urlImagen
            .trim()
        : "";

    if (!urlImagen) {
      response.status(400).json({
        ok: false,
        message:
          "Debes indicar la imagen que deseas eliminar",
      });

      return;
    }

    const articuloExistente =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    if (!articuloExistente) {
      response.status(404).json({
        ok: false,
        message:
          "El artículo no existe",
      });

      return;
    }

    if (
      !usuarioPuedeGestionarArticulo(
        request,
        articuloExistente.vendedor_id,
      )
    ) {
      response.status(403).json({
        ok: false,
        message:
          "No tienes permiso para eliminar imágenes de esta publicación",
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

    await eliminarArchivoDesdeUrl(
      urlImagen,
    );

    const articuloActualizado =
      await obtenerArticuloPorId(
        String(articuloId),
      );

    response.status(200).json({
      ok: true,
      message:
        "Imagen eliminada correctamente",
      articulo:
        articuloActualizado,
    });
  } catch (error) {
    response.status(400).json({
      ok: false,
      message:
        obtenerMensajeError(
          error,
        ),
    });
  }
}