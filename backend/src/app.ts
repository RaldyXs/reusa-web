import path from "node:path";

import cors from "cors";
import express from "express";

import adminRouter from "./routes/admin.routes.js";
import articuloRouter from "./routes/articulo.routes.js";
import authRouter from "./routes/auth.routes.js";
import categoriaRouter from "./routes/categoria.routes.js";
import favoritoRouter from "./routes/favorito.routes.js";
import ofertaRouter from "./routes/oferta.routes.js";
import cuentaRouter from "./routes/cuenta.routes.js";
import contactoRouter from "./routes/contacto.routes.js";

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
    origin: "http://localhost:5173",
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

app.use("/api/auth", authRouter);
app.use("/api/articulos", articuloRouter);
app.use("/api/categorias", categoriaRouter);
app.use("/api/favoritos", favoritoRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ofertas", ofertaRouter);
app.use("/api/cuenta", cuentaRouter);
app.use("/api/contactos",contactoRouter,);
export default app;