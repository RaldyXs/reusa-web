import { Router } from "express";

import {
  actualizarCategoriaAdmin,
  cambiarEstadoCategoriaAdmin,
  cambiarEstadoPublicacionAdmin,
  cambiarEstadoUsuarioAdmin,
  crearCategoriaAdmin,
  obtenerCategoriasAdmin,
  obtenerEstadisticasDashboardAdmin,
  obtenerOfertasAdmin,
  obtenerPublicacionesAdmin,
  obtenerResumenAdmin,
  obtenerUsuariosAdmin,
} from "../controllers/admin.controller.js";

import {
  permitirRoles,
  verificarToken,
} from "../middlewares/auth.middleware.js";

const adminRouter = Router();

adminRouter.use(
  verificarToken,
  permitirRoles(["administrador"]),
);

adminRouter.get(
  "/resumen",
  obtenerResumenAdmin,
);

adminRouter.get(
  "/estadisticas",
  obtenerEstadisticasDashboardAdmin,
);

adminRouter.get(
  "/usuarios",
  obtenerUsuariosAdmin,
);

adminRouter.patch(
  "/usuarios/:usuarioId/estado",
  cambiarEstadoUsuarioAdmin,
);

adminRouter.get(
  "/publicaciones",
  obtenerPublicacionesAdmin,
);

adminRouter.patch(
  "/publicaciones/:articuloId/estado",
  cambiarEstadoPublicacionAdmin,
);

adminRouter.get(
  "/ofertas",
  obtenerOfertasAdmin,
);

adminRouter.get(
  "/categorias",
  obtenerCategoriasAdmin,
);

adminRouter.post(
  "/categorias",
  crearCategoriaAdmin,
);

adminRouter.put(
  "/categorias/:categoriaId",
  actualizarCategoriaAdmin,
);

adminRouter.patch(
  "/categorias/:categoriaId/estado",
  cambiarEstadoCategoriaAdmin,
);

export default adminRouter;