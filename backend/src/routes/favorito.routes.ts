import { Router } from "express";

import {
  guardarFavorito,
  obtenerFavoritos,
  obtenerIdsFavoritos,
  quitarFavorito,
} from "../controllers/favorito.controller.js";

import {
  verificarToken,
} from "../middlewares/auth.middleware.js";

const favoritoRouter = Router();

favoritoRouter.use(
  verificarToken,
);

favoritoRouter.get(
  "/",
  obtenerFavoritos,
);

favoritoRouter.get(
  "/ids",
  obtenerIdsFavoritos,
);

favoritoRouter.post(
  "/:articuloId",
  guardarFavorito,
);

favoritoRouter.delete(
  "/:articuloId",
  quitarFavorito,
);

export default favoritoRouter;