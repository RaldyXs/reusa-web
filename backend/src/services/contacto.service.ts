import type {
  ContactoVendedor,
} from "../repositories/contacto.repository.js";

import {
  obtenerContactoVendedorDesdeBaseDeDatos,
} from "../repositories/contacto.repository.js";

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

export async function obtenerContactoVendedor(
  usuarioId: number,
  articuloId: number,
): Promise<ContactoVendedor> {
  validarIdentificador(
    usuarioId,
    "usuario",
  );

  validarIdentificador(
    articuloId,
    "artículo",
  );

  const contacto =
    await obtenerContactoVendedorDesdeBaseDeDatos(
      articuloId,
    );

  if (!contacto) {
    throw new Error(
      "El artículo indicado no existe",
    );
  }

  if (
    Number(contacto.vendedor_id) ===
    usuarioId
  ) {
    throw new Error(
      "No puedes solicitar tus propios datos de contacto",
    );
  }

  return contacto;
}