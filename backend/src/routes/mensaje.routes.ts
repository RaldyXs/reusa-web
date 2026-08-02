import {
  Router,
} from "express";

import {
  actualizarMensaje,
  borrarConversacion,
  borrarMensaje,
  iniciarConversacion,
  listarConversaciones,
  listarMensajes,
  registrarMensaje,
} from "../controllers/mensaje.controller.js";

import {
  verificarToken,
} from "../middlewares/auth.middleware.js";

import {
  subirImagenMensaje,
} from "../middlewares/upload.middleware.js";

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
  subirImagenMensaje,
  registrarMensaje,
);

mensajeRouter.delete(
  "/conversaciones/:conversacionId",
  borrarConversacion,
);

mensajeRouter.patch(
  "/:mensajeId",
  actualizarMensaje,
);

mensajeRouter.delete(
  "/:mensajeId",
  borrarMensaje,
);

export default mensajeRouter;