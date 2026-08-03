import {
  solicitarApi,
} from "./apiService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (
    import.meta.env.PROD
      ? "https://reusa-backend.onrender.com/api"
      : "http://localhost:3000/api"
  );


const API_URL =
  `${API_BASE_URL}/contactos`;

export interface ContactoVendedor {
  articulo_id: number;
  vendedor_id: number;
  vendedor: string;
  email: string;
  telefono: string | null;
}

interface RespuestaContacto {
  ok: boolean;
  message?: string;
  contacto?: ContactoVendedor;
}

export async function obtenerContactoVendedor(
  articuloId: number,
): Promise<ContactoVendedor> {
  const respuesta =
    await solicitarApi<RespuestaContacto>(
      `${API_URL}/articulo/${articuloId}`,
      {
        method: "GET",
      },
      true,
    );

  if (
    !respuesta.ok ||
    !respuesta.contacto
  ) {
    throw new Error(
      respuesta.message ??
        "No se pudo obtener el contacto del vendedor",
    );
  }

  return respuesta.contacto;
}