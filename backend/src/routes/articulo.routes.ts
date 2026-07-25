import { Router } from "express";

import {
  cambiarArchivadoArticulo,
  cambiarEstadoArticulo,
  editarArticulo,
  eliminarImagenArticulo,
  guardarImagenesArticulo,
  obtenerArticulo,
  obtenerArticulos,
  obtenerMisPublicaciones,
  publicarArticulo,
} from "../controllers/articulo.controller.js";

import {
  permitirRoles,
  verificarToken,
} from "../middlewares/auth.middleware.js";

import {
  subirImagenesArticulo,
} from "../middlewares/upload.middleware.js";

const articuloRouter = Router();

articuloRouter.get(
  "/mios",
  verificarToken,
  permitirRoles([
    "vendedor",
    "administrador",
  ]),
  obtenerMisPublicaciones,
);

articuloRouter.get("/", obtenerArticulos);

articuloRouter.post(
  "/",
  verificarToken,
  permitirRoles([
    "vendedor",
    "administrador",
  ]),
  publicarArticulo,
);

articuloRouter.post(
  "/:id/imagenes",
  verificarToken,
  permitirRoles([
    "vendedor",
    "administrador",
  ]),
  subirImagenesArticulo,
  guardarImagenesArticulo,
);

articuloRouter.delete(
  "/:id/imagenes",
  verificarToken,
  permitirRoles([
    "vendedor",
    "administrador",
  ]),
  eliminarImagenArticulo,
);

articuloRouter.patch(
  "/:id/estado",
  verificarToken,
  permitirRoles([
    "vendedor",
    "administrador",
  ]),
  cambiarEstadoArticulo,
);

articuloRouter.patch(
  "/:id/archivado",
  verificarToken,
  permitirRoles([
    "vendedor",
    "administrador",
  ]),
  cambiarArchivadoArticulo,
);

articuloRouter.put(
  "/:id",
  verificarToken,
  permitirRoles([
    "vendedor",
    "administrador",
  ]),
  editarArticulo,
);

articuloRouter.get(
  "/:id",
  obtenerArticulo,
);

export default articuloRouter;