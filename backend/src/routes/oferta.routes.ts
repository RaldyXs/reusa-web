import { Router } from "express";

import {
  actualizarEstadoOferta,
  listarOfertasRealizadas,
  listarOfertasRecibidas,
  registrarOferta,
} from "../controllers/oferta.controller.js";

import {
  verificarToken,
} from "../middlewares/auth.middleware.js";

const ofertaRouter = Router();

ofertaRouter.use(verificarToken);

ofertaRouter.post(
  "/",
  registrarOferta,
);

ofertaRouter.get(
  "/realizadas",
  listarOfertasRealizadas,
);

ofertaRouter.get(
  "/recibidas",
  listarOfertasRecibidas,
);

ofertaRouter.patch(
  "/:ofertaId/estado",
  actualizarEstadoOferta,
);

export default ofertaRouter;