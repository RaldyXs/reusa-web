import { Router } from "express";

import {
  obtenerContacto,
} from "../controllers/contacto.controller.js";

import {
  verificarToken,
} from "../middlewares/auth.middleware.js";

const contactoRouter = Router();

contactoRouter.use(
  verificarToken,
);

contactoRouter.get(
  "/articulo/:articuloId",
  obtenerContacto,
);

export default contactoRouter;