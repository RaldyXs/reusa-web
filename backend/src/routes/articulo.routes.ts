import { Router } from "express";

import {
  cambiarEstadoArticulo,
  editarArticulo,
  eliminarImagenArticulo,
  guardarImagenesArticulo,
  obtenerArticulo,
  obtenerArticulos,
  publicarArticulo,
} from "../controllers/articulo.controller.js";

import {
  subirImagenesArticulo,
} from "../middlewares/upload.middleware.js";

const articuloRouter = Router();

articuloRouter.get("/", obtenerArticulos);
articuloRouter.post("/", publicarArticulo);

articuloRouter.post(
  "/:id/imagenes",
  subirImagenesArticulo,
  guardarImagenesArticulo,
);

articuloRouter.delete(
  "/:id/imagenes",
  eliminarImagenArticulo,
);

articuloRouter.get("/:id", obtenerArticulo);
articuloRouter.put("/:id", editarArticulo);

articuloRouter.patch(
  "/:id/estado",
  cambiarEstadoArticulo,
);

export default articuloRouter;