import type {
  UploadApiResponse,
} from "cloudinary";

import {
  cloudinary,
} from "../config/cloudinary.js";

interface SubirImagenOpciones {
  carpeta: string;
}

export async function subirImagenACloudinary(
  buffer: Buffer,
  opciones: SubirImagenOpciones,
): Promise<UploadApiResponse> {
  return new Promise(
    (resolve, reject) => {
      const flujo =
        cloudinary.uploader.upload_stream(
          {
            folder:
              opciones.carpeta,

            resource_type:
              "image",

            allowed_formats: [
              "jpg",
              "jpeg",
              "png",
              "webp",
            ],

            transformation: [
              {
                quality: "auto",
                fetch_format:
                  "auto",
              },
            ],
          },
          (
            error,
            resultado,
          ) => {
            if (error) {
              reject(error);

              return;
            }

            if (!resultado) {
              reject(
                new Error(
                  "Cloudinary no devolvió información de la imagen",
                ),
              );

              return;
            }

            resolve(resultado);
          },
        );

      flujo.end(buffer);
    },
  );
}

export async function eliminarImagenDeCloudinary(
  publicId: string,
): Promise<void> {
  if (!publicId.trim()) {
    return;
  }

  await cloudinary.uploader.destroy(
    publicId,
    {
      resource_type:
        "image",
    },
  );
}