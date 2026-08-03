import path from "node:path";

import cors from "cors";
import express from "express";
import multer from "multer";

import adminRouter from "./routes/admin.routes.js";
import articuloRouter from "./routes/articulo.routes.js";
import authRouter from "./routes/auth.routes.js";
import categoriaRouter from "./routes/categoria.routes.js";
import contactoRouter from "./routes/contacto.routes.js";
import cuentaRouter from "./routes/cuenta.routes.js";
import favoritoRouter from "./routes/favorito.routes.js";
import mensajeRouter from "./routes/mensaje.routes.js";
import notificacionRouter from "./routes/notificacion.routes.js";
import ofertaRouter from "./routes/oferta.routes.js";

const app = express();

const carpetaUploads = path.resolve(
  __dirname,
  "..",
  "uploads",
);

console.log(
  "Carpeta pública de imágenes:",
  carpetaUploads,
);

app.use(
  cors({
    origin:
  process.env.FRONTEND_URL ??
  "http://localhost:5173",
  credentials: true,
  }),
);

app.use(express.json());

app.use(
  "/uploads",
  express.static(carpetaUploads),
);

app.get(
  "/api/health",
  (_request, response) => {
    response.status(200).json({
      ok: true,
      message:
        "API de Re-Usa Web funcionando correctamente",
    });
  },
);

app.use(
  "/api/auth",
  authRouter,
);

app.use(
  "/api/articulos",
  articuloRouter,
);

app.use(
  "/api/categorias",
  categoriaRouter,
);

app.use(
  "/api/favoritos",
  favoritoRouter,
);

app.use(
  "/api/admin",
  adminRouter,
);

app.use(
  "/api/ofertas",
  ofertaRouter,
);

app.use(
  "/api/cuenta",
  cuentaRouter,
);

app.use(
  "/api/contactos",
  contactoRouter,
);

app.use(
  "/api/notificaciones",
  notificacionRouter,
);

app.use(
  "/api/mensajes",
  mensajeRouter,
);

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ): void => {
    if (
      error instanceof
      multer.MulterError
    ) {
      let mensaje =
        "No se pudo procesar la imagen";

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        mensaje =
          "La imagen no puede superar los 5 MB";
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        mensaje =
          "Solo puedes enviar una imagen por mensaje";
      }

      if (
        error.code ===
        "LIMIT_UNEXPECTED_FILE"
      ) {
        mensaje =
          "El archivo enviado no es válido";
      }

      response.status(400).json({
        ok: false,
        message: mensaje,
      });

      return;
    }

    if (
      error instanceof Error
    ) {
      console.error(
        "Error no controlado:",
        error,
      );

      response.status(400).json({
        ok: false,
        message: error.message,
      });

      return;
    }

    next(error);
  },
);

export default app;