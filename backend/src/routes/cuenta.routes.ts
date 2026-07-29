import { Router } from "express";

import {
  actualizarPerfil,
  cambiarContrasena,
  obtenerPerfil,
} from "../controllers/cuenta.controller.js";

import {
  verificarToken,
} from "../middlewares/auth.middleware.js";

const cuentaRouter = Router();

cuentaRouter.use(verificarToken);

cuentaRouter.get(
  "/perfil",
  obtenerPerfil,
);

cuentaRouter.put(
  "/perfil",
  actualizarPerfil,
);

cuentaRouter.patch(
  "/contrasena",
  cambiarContrasena,
);

export default cuentaRouter;