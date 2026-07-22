import path from "node:path";

import cors from "cors";
import express from "express";

import articuloRouter from "./routes/articulo.routes.js";

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

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(carpetaUploads),
);

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    ok: true,
    message:
      "API de Re-Usa Web funcionando correctamente",
  });
});

app.use("/api/articulos", articuloRouter);

export default app;