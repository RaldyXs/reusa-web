import { Router } from "express";

import {
  actualizarEstadoOferta,
  listarOfertasRealizadas,
  listarOfertasRecibidas,
  registrarContraoferta,
  registrarOferta,
  responderContraofertaRecibida,
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

ofertaRouter.patch(
  "/:ofertaId/contraoferta",
  registrarContraoferta,
);

ofertaRouter.patch(
  "/:ofertaId/responder-contraoferta",
  responderContraofertaRecibida,
);

export default ofertaRouter;