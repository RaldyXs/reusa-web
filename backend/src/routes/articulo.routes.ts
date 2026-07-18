import { Router } from "express";
import { obtenerArticulos } from "../controllers/articulo.controller.js";

const articuloRouter = Router();

articuloRouter.get("/", obtenerArticulos);

export default articuloRouter;