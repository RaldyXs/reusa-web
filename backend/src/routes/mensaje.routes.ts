import { Router } from "express";

import {
  iniciarConversacion,
  listarConversaciones,
  listarMensajes,
  registrarMensaje,
} from "../controllers/mensaje.controller.js";

import {
  verificarToken,
} from "../middlewares/auth.middleware.js";

const mensajeRouter = Router();

mensajeRouter.use(
  verificarToken,
);

mensajeRouter.post(
  "/conversaciones",
  iniciarConversacion,
);

mensajeRouter.get(
  "/conversaciones",
  listarConversaciones,
);

mensajeRouter.get(
  "/conversaciones/:conversacionId",
  listarMensajes,
);

mensajeRouter.post(
  "/conversaciones/:conversacionId",
  registrarMensaje,
);

export default mensajeRouter;