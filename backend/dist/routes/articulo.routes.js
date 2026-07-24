"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articulo_controller_js_1 = require("../controllers/articulo.controller.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const upload_middleware_js_1 = require("../middlewares/upload.middleware.js");
const articuloRouter = (0, express_1.Router)();
articuloRouter.get("/", articulo_controller_js_1.obtenerArticulos);
articuloRouter.post("/", auth_middleware_js_1.verificarToken, (0, auth_middleware_js_1.permitirRoles)([
    "vendedor",
    "administrador",
]), articulo_controller_js_1.publicarArticulo);
articuloRouter.post("/:id/imagenes", auth_middleware_js_1.verificarToken, (0, auth_middleware_js_1.permitirRoles)([
    "vendedor",
    "administrador",
]), upload_middleware_js_1.subirImagenesArticulo, articulo_controller_js_1.guardarImagenesArticulo);
articuloRouter.delete("/:id/imagenes", auth_middleware_js_1.verificarToken, (0, auth_middleware_js_1.permitirRoles)([
    "vendedor",
    "administrador",
]), articulo_controller_js_1.eliminarImagenArticulo);
articuloRouter.patch("/:id/estado", auth_middleware_js_1.verificarToken, (0, auth_middleware_js_1.permitirRoles)([
    "vendedor",
    "administrador",
]), articulo_controller_js_1.cambiarEstadoArticulo);
articuloRouter.patch("/:id/archivado", auth_middleware_js_1.verificarToken, (0, auth_middleware_js_1.permitirRoles)([
    "vendedor",
    "administrador",
]), articulo_controller_js_1.cambiarArchivadoArticulo);
articuloRouter.put("/:id", auth_middleware_js_1.verificarToken, (0, auth_middleware_js_1.permitirRoles)([
    "vendedor",
    "administrador",
]), articulo_controller_js_1.editarArticulo);
articuloRouter.get("/:id", articulo_controller_js_1.obtenerArticulo);
exports.default = articuloRouter;
