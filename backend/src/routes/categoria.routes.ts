import { Router } from "express";

import {
  obtenerCategorias,
} from "../controllers/categoria.controller.js";

const categoriaRouter = Router();

categoriaRouter.get(
  "/",
  obtenerCategorias,
);

export default categoriaRouter;