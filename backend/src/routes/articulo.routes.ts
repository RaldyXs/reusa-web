import { Router } from "express";

import {
  cambiarArchivadoArticulo,
  cambiarEstadoArticulo,
  editarArticulo,
  eliminarImagenArticulo,
  eliminarPublicacion,
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
    "usuario",
    "administrador",
  ]),
  obtenerMisPublicaciones,
);

articuloRouter.get(
  "/",
  obtenerArticulos,
);

articuloRouter.post(
  "/",
  verificarToken,
  permitirRoles([
    "usuario",
    "administrador",
  ]),
  publicarArticulo,
);

articuloRouter.post(
  "/:id/imagenes",
  verificarToken,
  permitirRoles([
    "usuario",
    "administrador",
  ]),
  subirImagenesArticulo,
  guardarImagenesArticulo,
);

articuloRouter.delete(
  "/:id/imagenes",
  verificarToken,
  permitirRoles([
    "usuario",
    "administrador",
  ]),
  eliminarImagenArticulo,
);

articuloRouter.patch(
  "/:id/estado",
  verificarToken,
  permitirRoles([
    "usuario",
    "administrador",
  ]),
  cambiarEstadoArticulo,
);

articuloRouter.patch(
  "/:id/archivado",
  verificarToken,
  permitirRoles([
    "usuario",
    "administrador",
  ]),
  cambiarArchivadoArticulo,
);

articuloRouter.put(
  "/:id",
  verificarToken,
  permitirRoles([
    "usuario",
    "administrador",
  ]),
  editarArticulo,
);

articuloRouter.delete(
  "/:id",
  verificarToken,
  permitirRoles([
    "usuario",
    "administrador",
  ]),
  eliminarPublicacion,
);

articuloRouter.get(
  "/:id",
  obtenerArticulo,
);

export default articuloRouter;