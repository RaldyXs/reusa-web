import { Router } from "express";

import {
  login,
  registrar,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/registro", registrar);

export default authRouter;