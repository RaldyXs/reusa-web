import type {
  ArticuloFavorito,
} from "../repositories/favorito.repository.js";

import {
  buscarFavoritoDesdeBaseDeDatos,
  crearFavoritoEnBaseDeDatos,
  eliminarFavoritoDesdeBaseDeDatos,
  obtenerFavoritosPorUsuarioDesdeBaseDeDatos,
  obtenerIdsFavoritosPorUsuarioDesdeBaseDeDatos,
} from "../repositories/favorito.repository.js";

import {
  obtenerArticuloPorIdEnBaseDeDatos,
} from "../repositories/articulo.repository.js";

function validarIdentificador(
  valor: number,
  nombre: string,
): void {
  if (
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    throw new Error(
      `El identificador de ${nombre} no es válido`,
    );
  }
}

export async function obtenerFavoritosUsuario(
  usuarioId: number,
): Promise<ArticuloFavorito[]> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  return obtenerFavoritosPorUsuarioDesdeBaseDeDatos(
    usuarioId,
  );
}

export async function obtenerIdsFavoritosUsuario(
  usuarioId: number,
): Promise<number[]> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  return obtenerIdsFavoritosPorUsuarioDesdeBaseDeDatos(
    usuarioId,
  );
}

export async function guardarArticuloFavorito(
  usuarioId: number,
  articuloId: number,
): Promise<{
  favoritoId: number;
  articuloId: number;
}> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  validarIdentificador(
    articuloId,
    "artículo",
  );

  const articulo =
    await obtenerArticuloPorIdEnBaseDeDatos(
      articuloId,
    );

  if (!articulo) {
    throw new Error(
      "El artículo indicado no existe",
    );
  }

  if (articulo.archivado === 1) {
    throw new Error(
      "No puedes guardar una publicación archivada",
    );
  }

  const favoritoExistente =
    await buscarFavoritoDesdeBaseDeDatos(
      usuarioId,
      articuloId,
    );

  if (favoritoExistente) {
    return {
      favoritoId: favoritoExistente,
      articuloId,
    };
  }

  const favoritoId =
    await crearFavoritoEnBaseDeDatos(
      usuarioId,
      articuloId,
    );

  if (
    !Number.isInteger(favoritoId) ||
    favoritoId <= 0
  ) {
    throw new Error(
      "No se pudo guardar el artículo",
    );
  }

  return {
    favoritoId,
    articuloId,
  };
}

export async function quitarArticuloFavorito(
  usuarioId: number,
  articuloId: number,
): Promise<void> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  validarIdentificador(
    articuloId,
    "artículo",
  );

  const eliminado =
    await eliminarFavoritoDesdeBaseDeDatos(
      usuarioId,
      articuloId,
    );

  if (!eliminado) {
    throw new Error(
      "El artículo no estaba guardado",
    );
  }
}