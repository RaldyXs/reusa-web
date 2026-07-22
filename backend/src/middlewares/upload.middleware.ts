import fs from "node:fs";
import path from "node:path";

import multer from "multer";

const carpetaImagenes = path.resolve(
  process.cwd(),
  "uploads",
  "articulos",
);

fs.mkdirSync(carpetaImagenes, {
  recursive: true,
});

const almacenamiento = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, carpetaImagenes);
  },

  filename: (_request, file, callback) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const nombreUnico = [
      Date.now(),
      Math.round(Math.random() * 1_000_000_000),
    ].join("-");

    callback(null, `${nombreUnico}${extension}`);
  },
});

const tiposPermitidos = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const subirImagenesArticulo = multer({
  storage: almacenamiento,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },

  fileFilter: (_request, file, callback) => {
    if (!tiposPermitidos.has(file.mimetype)) {
      callback(
        new Error(
          "Solo se permiten imágenes JPG, PNG o WEBP",
        ),
      );

      return;
    }

    callback(null, true);
  },
}).array("imagenes", 5);