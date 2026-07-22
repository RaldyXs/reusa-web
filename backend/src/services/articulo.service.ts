import type {
  Articulo,
  CrearArticuloDatos,
} from "../models/articulo.model.js";

import {
  actualizarArticuloEnBaseDeDatos,
  actualizarEstadoArticuloEnBaseDeDatos,
  buscarArticulosEnBaseDeDatos,
  crearArticuloEnBaseDeDatos,
  obtenerArticuloPorIdEnBaseDeDatos,
  type ActualizarArticuloDatos,
  type EstadoArticulo,
} from "../repositories/articulo.repository.js";

interface CrearArticuloEntrada {
  titulo?: unknown;
  descripcion?: unknown;
  precio?: unknown;
  condicion?: unknown;
  ubicacion?: unknown;
  categoriaId?: unknown;
  vendedorId?: unknown;
}

interface ActualizarArticuloEntrada {
  titulo?: unknown;
  descripcion?: unknown;
  precio?: unknown;
  condicion?: unknown;
  ubicacion?: unknown;
  categoriaId?: unknown;
}

interface ActualizarEstadoEntrada {
  estado?: unknown;
}

function convertirArticuloId(articuloId: string): number {
  const idConvertido = Number(articuloId);

  if (
    !Number.isInteger(idConvertido) ||
    idConvertido < 1
  ) {
    throw new Error(
      "El identificador del artículo no es válido",
    );
  }

  return idConvertido;
}

function validarDatosArticulo(
  entrada: ActualizarArticuloEntrada,
): ActualizarArticuloDatos {
  const titulo =
    typeof entrada.titulo === "string"
      ? entrada.titulo.trim()
      : "";

  const descripcion =
    typeof entrada.descripcion === "string"
      ? entrada.descripcion.trim()
      : "";

  const ubicacion =
    typeof entrada.ubicacion === "string"
      ? entrada.ubicacion.trim()
      : "";

  const precio = Number(entrada.precio);
  const categoriaId = Number(entrada.categoriaId);
  const condicion = entrada.condicion;

  if (titulo.length < 3) {
    throw new Error(
      "El título debe tener al menos 3 caracteres",
    );
  }

  if (descripcion.length < 10) {
    throw new Error(
      "La descripción debe tener al menos 10 caracteres",
    );
  }

  if (!Number.isFinite(precio) || precio <= 0) {
    throw new Error(
      "El precio debe ser mayor que cero",
    );
  }

  if (
    !Number.isInteger(categoriaId) ||
    categoriaId < 1
  ) {
    throw new Error(
      "La categoría seleccionada no es válida",
    );
  }

  if (
    condicion !== "nuevo" &&
    condicion !== "usado" &&
    condicion !== "reparado"
  ) {
    throw new Error(
      "La condición seleccionada no es válida",
    );
  }

  if (!ubicacion) {
    throw new Error("La ubicación es obligatoria");
  }

  return {
    titulo,
    descripcion,
    precio,
    condicion,
    ubicacion,
    categoriaId,
  };
}

export async function buscarArticulos(
  termino: string | undefined,
  categoriaId: string | undefined,
): Promise<Articulo[]> {
  const terminoLimpio = termino?.trim() ?? "";

  let categoriaConvertida: number | null = null;

  if (categoriaId) {
    const numeroCategoria = Number(categoriaId);

    if (
      !Number.isInteger(numeroCategoria) ||
      numeroCategoria < 1
    ) {
      throw new Error(
        "La categoría proporcionada no es válida",
      );
    }

    categoriaConvertida = numeroCategoria;
  }

  return buscarArticulosEnBaseDeDatos(
    terminoLimpio,
    categoriaConvertida,
  );
}

export async function obtenerArticuloPorId(
  articuloId: string,
): Promise<Articulo | null> {
  const idConvertido = convertirArticuloId(articuloId);

  return obtenerArticuloPorIdEnBaseDeDatos(
    idConvertido,
  );
}

export async function crearArticulo(
  entrada: CrearArticuloEntrada,
): Promise<Articulo> {
  const datosArticulo = validarDatosArticulo(entrada);

  const vendedorId = Number(entrada.vendedorId ?? 1);

  if (
    !Number.isInteger(vendedorId) ||
    vendedorId < 1
  ) {
    throw new Error(
      "El vendedor proporcionado no es válido",
    );
  }

  const datos: CrearArticuloDatos = {
    ...datosArticulo,
    vendedorId,
  };

  const articuloId =
    await crearArticuloEnBaseDeDatos(datos);

  const articulo =
    await obtenerArticuloPorIdEnBaseDeDatos(
      articuloId,
    );

  if (!articulo) {
    throw new Error(
      "El artículo fue creado, pero no pudo recuperarse",
    );
  }

  return articulo;
}

export async function actualizarArticulo(
  articuloId: string,
  entrada: ActualizarArticuloEntrada,
): Promise<Articulo> {
  const idConvertido = convertirArticuloId(articuloId);
  const datos = validarDatosArticulo(entrada);

  const articuloActual =
    await obtenerArticuloPorIdEnBaseDeDatos(
      idConvertido,
    );

  if (!articuloActual) {
    throw new Error("El artículo no existe");
  }

  const actualizado =
    await actualizarArticuloEnBaseDeDatos(
      idConvertido,
      datos,
    );

  if (!actualizado) {
    throw new Error(
      "No se pudo actualizar el artículo",
    );
  }

  const articuloActualizado =
    await obtenerArticuloPorIdEnBaseDeDatos(
      idConvertido,
    );

  if (!articuloActualizado) {
    throw new Error(
      "El artículo fue actualizado, pero no pudo recuperarse",
    );
  }

  return articuloActualizado;
}

export async function actualizarEstadoArticulo(
  articuloId: string,
  entrada: ActualizarEstadoEntrada,
): Promise<Articulo> {
  const idConvertido = convertirArticuloId(articuloId);
  const estado = entrada.estado;

  if (
    estado !== "activo" &&
    estado !== "vendido" &&
    estado !== "archivado"
  ) {
    throw new Error(
      "El estado proporcionado no es válido",
    );
  }

  const articuloActual =
    await obtenerArticuloPorIdEnBaseDeDatos(
      idConvertido,
    );

  if (!articuloActual) {
    throw new Error("El artículo no existe");
  }

  const actualizado =
    await actualizarEstadoArticuloEnBaseDeDatos(
      idConvertido,
      estado,
    );

  if (!actualizado) {
    throw new Error(
      "No se pudo actualizar el estado del artículo",
    );
  }

  return {
    ...articuloActual,
    estado,
  };
}