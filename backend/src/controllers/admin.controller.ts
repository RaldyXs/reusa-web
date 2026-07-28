import type {
  Request,
  Response,
} from "express";

import {
  actualizarCategoriaAdministracion,
  cambiarEstadoCategoriaAdministracion,
  cambiarEstadoPublicacionAdministracion,
  cambiarEstadoUsuarioAdministracion,
  crearCategoriaAdministracion,
  obtenerCategoriasAdministracion,
  obtenerPublicacionesAdministracion,
  obtenerResumenAdministracion,
  obtenerUsuariosAdministracion,
} from "../services/admin.service.js";

interface UsuarioAutenticado {
  usuarioId?: unknown;
}

interface RequestAutenticado extends Request {
  usuario?: UsuarioAutenticado;
}

function obtenerCodigoEstado(
  mensaje: string,
): number {
  if (mensaje.includes("no existe")) {
    return 404;
  }

  if (mensaje.includes("Ya existe")) {
    return 409;
  }

  if (
    mensaje.includes(
      "No puedes desactivar tu propia cuenta",
    )
  ) {
    return 403;
  }

  if (
    mensaje.includes("no es válido") ||
    mensaje.includes("debe tener") ||
    mensaje.includes("no puede superar") ||
    mensaje.includes("Debes indicar") ||
    mensaje.includes(
      "No se pudo identificar",
    )
  ) {
    return 400;
  }

  return 500;
}

export async function obtenerResumenAdmin(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const resumen =
      await obtenerResumenAdministracion();

    response.status(200).json({
      ok: true,
      resumen,
    });
  } catch (errorDesconocido) {
    console.error(
      "Error al obtener el resumen administrativo:",
      errorDesconocido,
    );

    response.status(500).json({
      ok: false,
      message:
        "No se pudo obtener el resumen administrativo",
    });
  }
}

export async function obtenerUsuariosAdmin(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const usuarios =
      await obtenerUsuariosAdministracion();

    response.status(200).json({
      ok: true,
      usuarios,
    });
  } catch (errorDesconocido) {
    console.error(
      "Error al obtener los usuarios administrativos:",
      errorDesconocido,
    );

    response.status(500).json({
      ok: false,
      message:
        "No se pudieron obtener los usuarios",
    });
  }
}

export async function cambiarEstadoUsuarioAdmin(
  request: RequestAutenticado,
  response: Response,
): Promise<void> {
  try {
    const usuarioId = Number(
      request.params.usuarioId,
    );

    const administradorId = Number(
      request.usuario?.usuarioId,
    );

    const activo = request.body?.activo;

    if (
      !Number.isInteger(usuarioId) ||
      usuarioId <= 0
    ) {
      response.status(400).json({
        ok: false,
        message:
          "El identificador del usuario no es válido",
      });

      return;
    }

    if (
      !Number.isInteger(administradorId) ||
      administradorId <= 0
    ) {
      response.status(401).json({
        ok: false,
        message:
          "No se pudo identificar al administrador",
      });

      return;
    }

    if (typeof activo !== "boolean") {
      response.status(400).json({
        ok: false,
        message:
          "Debes indicar un estado válido",
      });

      return;
    }

    const usuario =
      await cambiarEstadoUsuarioAdministracion(
        usuarioId,
        activo,
        administradorId,
      );

    response.status(200).json({
      ok: true,
      message: activo
        ? "Usuario activado correctamente"
        : "Usuario desactivado correctamente",
      usuario,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo actualizar el usuario";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al cambiar el estado del usuario:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function obtenerPublicacionesAdmin(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const publicaciones =
      await obtenerPublicacionesAdministracion();

    response.status(200).json({
      ok: true,
      publicaciones,
    });
  } catch (errorDesconocido) {
    console.error(
      "Error al obtener las publicaciones administrativas:",
      errorDesconocido,
    );

    response.status(500).json({
      ok: false,
      message:
        "No se pudieron obtener las publicaciones",
    });
  }
}

export async function cambiarEstadoPublicacionAdmin(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const articuloId = Number(
      request.params.articuloId,
    );

    const estado = request.body?.estado;

    if (
      !Number.isInteger(articuloId) ||
      articuloId <= 0
    ) {
      response.status(400).json({
        ok: false,
        message:
          "El identificador de la publicación no es válido",
      });

      return;
    }

    if (typeof estado !== "string") {
      response.status(400).json({
        ok: false,
        message:
          "Debes indicar un estado válido",
      });

      return;
    }

    const publicacion =
      await cambiarEstadoPublicacionAdministracion(
        articuloId,
        estado as
          | "activo"
          | "vendido"
          | "archivado",
      );

    response.status(200).json({
      ok: true,
      message:
        estado === "activo"
          ? "Publicación activada correctamente"
          : estado === "vendido"
            ? "Publicación marcada como vendida"
            : "Publicación archivada correctamente",
      publicacion,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo actualizar la publicación";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al cambiar el estado de la publicación:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function obtenerCategoriasAdmin(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const categorias =
      await obtenerCategoriasAdministracion();

    response.status(200).json({
      ok: true,
      categorias,
    });
  } catch (errorDesconocido) {
    console.error(
      "Error al obtener las categorías administrativas:",
      errorDesconocido,
    );

    response.status(500).json({
      ok: false,
      message:
        "No se pudieron obtener las categorías",
    });
  }
}

export async function crearCategoriaAdmin(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const categoria =
      await crearCategoriaAdministracion({
        nombre: request.body?.nombre,
        descripcion:
          request.body?.descripcion,
      });

    response.status(201).json({
      ok: true,
      message:
        "Categoría creada correctamente",
      categoria,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo crear la categoría";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al crear la categoría:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function actualizarCategoriaAdmin(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const categoriaId = Number(
      request.params.categoriaId,
    );

    if (
      !Number.isInteger(categoriaId) ||
      categoriaId <= 0
    ) {
      response.status(400).json({
        ok: false,
        message:
          "El identificador de la categoría no es válido",
      });

      return;
    }

    const categoria =
      await actualizarCategoriaAdministracion(
        categoriaId,
        {
          nombre: request.body?.nombre,
          descripcion:
            request.body?.descripcion,
        },
      );

    response.status(200).json({
      ok: true,
      message:
        "Categoría actualizada correctamente",
      categoria,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo actualizar la categoría";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al actualizar la categoría:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}

export async function cambiarEstadoCategoriaAdmin(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const categoriaId = Number(
      request.params.categoriaId,
    );

    const activo = request.body?.activo;

    if (
      !Number.isInteger(categoriaId) ||
      categoriaId <= 0
    ) {
      response.status(400).json({
        ok: false,
        message:
          "El identificador de la categoría no es válido",
      });

      return;
    }

    if (typeof activo !== "boolean") {
      response.status(400).json({
        ok: false,
        message:
          "Debes indicar un estado válido",
      });

      return;
    }

    const categoria =
      await cambiarEstadoCategoriaAdministracion(
        categoriaId,
        activo,
      );

    response.status(200).json({
      ok: true,
      message: activo
        ? "Categoría activada correctamente"
        : "Categoría desactivada correctamente",
      categoria,
    });
  } catch (errorDesconocido) {
    const mensaje =
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo actualizar la categoría";

    const codigoEstado =
      obtenerCodigoEstado(mensaje);

    if (codigoEstado === 500) {
      console.error(
        "Error al cambiar el estado de la categoría:",
        errorDesconocido,
      );
    }

    response.status(codigoEstado).json({
      ok: false,
      message: mensaje,
    });
  }
}