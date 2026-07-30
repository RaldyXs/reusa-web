import { Router } from "express";

import {
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  obtenerResumenNotificaciones,
} from "../controllers/notificacion.controller.js";

import {
  verificarToken,
} from "../middlewares/auth.middleware.js";

const notificacionRouter = Router();

notificacionRouter.use(verificarToken);

notificacionRouter.get(
  "/",
  listarNotificaciones,
);

notificacionRouter.get(
  "/resumen",
  obtenerResumenNotificaciones,
);

notificacionRouter.patch(
  "/:notificacionId/leida",
  marcarNotificacionLeida,
);

notificacionRouter.patch(
  "/marcar-todas/leidas",
  marcarTodasLeidas,
);

export default notificacionRouter;