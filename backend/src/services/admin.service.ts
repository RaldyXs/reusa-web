import type {
  PublicacionAdministracion,
  ResumenAdministracion,
  UsuarioAdministracion,
} from "../models/admin.model.js";

import {
  actualizarCategoriaAdministracionDesdeBaseDeDatos,
  actualizarEstadoCategoriaAdministracionDesdeBaseDeDatos,
  actualizarEstadoPublicacionDesdeBaseDeDatos,
  actualizarEstadoUsuarioDesdeBaseDeDatos,
  crearCategoriaAdministracionDesdeBaseDeDatos,
  obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos,
  obtenerCategoriaAdministracionPorNombreDesdeBaseDeDatos,
  obtenerCategoriasAdministracionDesdeBaseDeDatos,
  obtenerPublicacionAdministracionPorIdDesdeBaseDeDatos,
  obtenerPublicacionesAdministracionDesdeBaseDeDatos,
  obtenerResumenAdministracionDesdeBaseDeDatos,
  obtenerUsuarioAdministracionPorIdDesdeBaseDeDatos,
  obtenerUsuariosAdministracionDesdeBaseDeDatos,
  type CategoriaAdministracion,
} from "../repositories/admin.repository.js";

type EstadoPublicacionAdministracion =
  | "activo"
  | "vendido"
  | "archivado";

interface DatosCategoriaAdministracion {
  nombre: unknown;
  descripcion?: unknown;
}

function normalizarNombreCategoria(
  valor: unknown,
): string {
  return typeof valor === "string"
    ? valor.trim()
    : "";
}

function normalizarDescripcionCategoria(
  valor: unknown,
): string | null {
  if (typeof valor !== "string") {
    return null;
  }

  const descripcion = valor.trim();

  return descripcion || null;
}

function validarCategoria(
  datos: DatosCategoriaAdministracion,
): {
  nombre: string;
  descripcion: string | null;
} {
  const nombre =
    normalizarNombreCategoria(datos.nombre);

  const descripcion =
    normalizarDescripcionCategoria(
      datos.descripcion,
    );

  if (nombre.length < 2) {
    throw new Error(
      "El nombre de la categoría debe tener al menos 2 caracteres",
    );
  }

  if (nombre.length > 100) {
    throw new Error(
      "El nombre de la categoría no puede superar los 100 caracteres",
    );
  }

  if (
    descripcion &&
    descripcion.length > 500
  ) {
    throw new Error(
      "La descripción no puede superar los 500 caracteres",
    );
  }

  return {
    nombre,
    descripcion,
  };
}

export async function obtenerResumenAdministracion(): Promise<
  ResumenAdministracion
> {
  return obtenerResumenAdministracionDesdeBaseDeDatos();
}

export async function obtenerUsuariosAdministracion(): Promise<
  UsuarioAdministracion[]
> {
  return obtenerUsuariosAdministracionDesdeBaseDeDatos();
}

export async function cambiarEstadoUsuarioAdministracion(
  usuarioId: number,
  activo: boolean,
  administradorId: number,
): Promise<UsuarioAdministracion> {
  if (
    !Number.isInteger(usuarioId) ||
    usuarioId <= 0
  ) {
    throw new Error(
      "El identificador del usuario no es válido",
    );
  }

  if (
    !Number.isInteger(administradorId) ||
    administradorId <= 0
  ) {
    throw new Error(
      "No se pudo identificar al administrador",
    );
  }

  if (typeof activo !== "boolean") {
    throw new Error(
      "El estado del usuario no es válido",
    );
  }

  const usuario =
    await obtenerUsuarioAdministracionPorIdDesdeBaseDeDatos(
      usuarioId,
    );

  if (!usuario) {
    throw new Error(
      "El usuario indicado no existe",
    );
  }

  if (
    usuarioId === administradorId &&
    !activo
  ) {
    throw new Error(
      "No puedes desactivar tu propia cuenta",
    );
  }

  const estadoActual =
    Number(usuario.activo) === 1;

  if (estadoActual === activo) {
    return usuario;
  }

  const actualizado =
    await actualizarEstadoUsuarioDesdeBaseDeDatos(
      usuarioId,
      activo,
    );

  if (!actualizado) {
    throw new Error(
      "No se pudo actualizar el estado del usuario",
    );
  }

  const usuarioActualizado =
    await obtenerUsuarioAdministracionPorIdDesdeBaseDeDatos(
      usuarioId,
    );

  if (!usuarioActualizado) {
    throw new Error(
      "El usuario fue actualizado, pero no pudo recuperarse",
    );
  }

  return usuarioActualizado;
}

export async function obtenerPublicacionesAdministracion(): Promise<
  PublicacionAdministracion[]
> {
  return obtenerPublicacionesAdministracionDesdeBaseDeDatos();
}

export async function cambiarEstadoPublicacionAdministracion(
  articuloId: number,
  estado: EstadoPublicacionAdministracion,
): Promise<PublicacionAdministracion> {
  if (
    !Number.isInteger(articuloId) ||
    articuloId <= 0
  ) {
    throw new Error(
      "El identificador de la publicación no es válido",
    );
  }

  const estadosPermitidos: EstadoPublicacionAdministracion[] =
    [
      "activo",
      "vendido",
      "archivado",
    ];

  if (!estadosPermitidos.includes(estado)) {
    throw new Error(
      "El estado de la publicación no es válido",
    );
  }

  const publicacion =
    await obtenerPublicacionAdministracionPorIdDesdeBaseDeDatos(
      articuloId,
    );

  if (!publicacion) {
    throw new Error(
      "La publicación indicada no existe",
    );
  }

  const yaTieneEseEstado =
    publicacion.estado === estado &&
    Number(publicacion.archivado) ===
      (estado === "archivado" ? 1 : 0);

  if (yaTieneEseEstado) {
    return publicacion;
  }

  const actualizada =
    await actualizarEstadoPublicacionDesdeBaseDeDatos(
      articuloId,
      estado,
    );

  if (!actualizada) {
    throw new Error(
      "No se pudo actualizar el estado de la publicación",
    );
  }

  const publicacionActualizada =
    await obtenerPublicacionAdministracionPorIdDesdeBaseDeDatos(
      articuloId,
    );

  if (!publicacionActualizada) {
    throw new Error(
      "La publicación fue actualizada, pero no pudo recuperarse",
    );
  }

  return publicacionActualizada;
}

export async function obtenerCategoriasAdministracion(): Promise<
  CategoriaAdministracion[]
> {
  return obtenerCategoriasAdministracionDesdeBaseDeDatos();
}

export async function crearCategoriaAdministracion(
  datos: DatosCategoriaAdministracion,
): Promise<CategoriaAdministracion> {
  const categoriaValidada =
    validarCategoria(datos);

  const categoriaExistente =
    await obtenerCategoriaAdministracionPorNombreDesdeBaseDeDatos(
      categoriaValidada.nombre,
    );

  if (categoriaExistente) {
    throw new Error(
      "Ya existe una categoría con ese nombre",
    );
  }

  const categoriaId =
    await crearCategoriaAdministracionDesdeBaseDeDatos(
      categoriaValidada,
    );

  if (
    !Number.isInteger(categoriaId) ||
    categoriaId <= 0
  ) {
    throw new Error(
      "No se pudo crear la categoría",
    );
  }

  const categoriaCreada =
    await obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos(
      categoriaId,
    );

  if (!categoriaCreada) {
    throw new Error(
      "La categoría fue creada, pero no pudo recuperarse",
    );
  }

  return categoriaCreada;
}

export async function actualizarCategoriaAdministracion(
  categoriaId: number,
  datos: DatosCategoriaAdministracion,
): Promise<CategoriaAdministracion> {
  if (
    !Number.isInteger(categoriaId) ||
    categoriaId <= 0
  ) {
    throw new Error(
      "El identificador de la categoría no es válido",
    );
  }

  const categoriaActual =
    await obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos(
      categoriaId,
    );

  if (!categoriaActual) {
    throw new Error(
      "La categoría indicada no existe",
    );
  }

  const categoriaValidada =
    validarCategoria(datos);

  const categoriaDuplicada =
    await obtenerCategoriaAdministracionPorNombreDesdeBaseDeDatos(
      categoriaValidada.nombre,
      categoriaId,
    );

  if (categoriaDuplicada) {
    throw new Error(
      "Ya existe otra categoría con ese nombre",
    );
  }

  const mismosDatos =
    categoriaActual.nombre ===
      categoriaValidada.nombre &&
    (categoriaActual.descripcion ?? null) ===
      categoriaValidada.descripcion;

  if (mismosDatos) {
    return categoriaActual;
  }

  const actualizada =
    await actualizarCategoriaAdministracionDesdeBaseDeDatos(
      categoriaId,
      categoriaValidada,
    );

  if (!actualizada) {
    throw new Error(
      "No se pudo actualizar la categoría",
    );
  }

  const categoriaActualizada =
    await obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos(
      categoriaId,
    );

  if (!categoriaActualizada) {
    throw new Error(
      "La categoría fue actualizada, pero no pudo recuperarse",
    );
  }

  return categoriaActualizada;
}

export async function cambiarEstadoCategoriaAdministracion(
  categoriaId: number,
  activo: boolean,
): Promise<CategoriaAdministracion> {
  if (
    !Number.isInteger(categoriaId) ||
    categoriaId <= 0
  ) {
    throw new Error(
      "El identificador de la categoría no es válido",
    );
  }

  if (typeof activo !== "boolean") {
    throw new Error(
      "El estado de la categoría no es válido",
    );
  }

  const categoria =
    await obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos(
      categoriaId,
    );

  if (!categoria) {
    throw new Error(
      "La categoría indicada no existe",
    );
  }

  const estadoActual =
    Number(categoria.activo) === 1;

  if (estadoActual === activo) {
    return categoria;
  }

  const actualizada =
    await actualizarEstadoCategoriaAdministracionDesdeBaseDeDatos(
      categoriaId,
      activo,
    );

  if (!actualizada) {
    throw new Error(
      "No se pudo actualizar el estado de la categoría",
    );
  }

  const categoriaActualizada =
    await obtenerCategoriaAdministracionPorIdDesdeBaseDeDatos(
      categoriaId,
    );

  if (!categoriaActualizada) {
    throw new Error(
      "La categoría fue actualizada, pero no pudo recuperarse",
    );
  }

  return categoriaActualizada;
}