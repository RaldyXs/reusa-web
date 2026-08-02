import fs from "node:fs";
import path from "node:path";

import multer from "multer";

const carpetaArticulos = path.resolve(
  process.cwd(),
  "uploads",
  "articulos",
);

const carpetaMensajes = path.resolve(
  process.cwd(),
  "uploads",
  "mensajes",
);

fs.mkdirSync(carpetaArticulos, {
  recursive: true,
});

fs.mkdirSync(carpetaMensajes, {
  recursive: true,
});

const tiposPermitidos = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function crearNombreArchivo(
  nombreOriginal: string,
): string {
  const extension = path
    .extname(nombreOriginal)
    .toLowerCase();

  const nombreUnico = [
    Date.now(),
    Math.round(
      Math.random() *
        1_000_000_000,
    ),
  ].join("-");

  return `${nombreUnico}${extension}`;
}

function validarImagen(
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
): void {
  if (
    !tiposPermitidos.has(
      file.mimetype,
    )
  ) {
    callback(
      new Error(
        "Solo se permiten imágenes JPG, PNG o WEBP",
      ),
    );

    return;
  }

  callback(null, true);
}

const almacenamientoArticulos =
  multer.diskStorage({
    destination: (
      _request,
      _file,
      callback,
    ) => {
      callback(
        null,
        carpetaArticulos,
      );
    },

    filename: (
      _request,
      file,
      callback,
    ) => {
      callback(
        null,
        crearNombreArchivo(
          file.originalname,
        ),
      );
    },
  });

const almacenamientoMensajes =
  multer.diskStorage({
    destination: (
      _request,
      _file,
      callback,
    ) => {
      callback(
        null,
        carpetaMensajes,
      );
    },

    filename: (
      _request,
      file,
      callback,
    ) => {
      callback(
        null,
        crearNombreArchivo(
          file.originalname,
        ),
      );
    },
  });

export const subirImagenesArticulo =
  multer({
    storage:
      almacenamientoArticulos,

    limits: {
      fileSize:
        5 * 1024 * 1024,
      files: 5,
    },

    fileFilter: (
      _request,
      file,
      callback,
    ) => {
      validarImagen(
        file,
        callback,
      );
    },
  }).array(
    "imagenes",
    5,
  );

export const subirImagenMensaje =
  multer({
    storage:
      almacenamientoMensajes,

    limits: {
      fileSize:
        5 * 1024 * 1024,
      files: 1,
    },

    fileFilter: (
      _request,
      file,
      callback,
    ) => {
      validarImagen(
        file,
        callback,
      );
    },
  }).single(
    "imagen",
  );