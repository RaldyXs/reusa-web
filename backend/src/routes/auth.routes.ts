import { Router } from "express";

import {
  login,
  registrar,
  restablecerContrasena,
  solicitarRecuperacionContrasena,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post(
  "/login",
  login,
);

authRouter.post(
  "/registro",
  registrar,
);

authRouter.post(
  "/recuperar-contrasena",
  solicitarRecuperacionContrasena,
);

authRouter.post(
  "/restablecer-contrasena",
  restablecerContrasena,
);

export default authRouter;