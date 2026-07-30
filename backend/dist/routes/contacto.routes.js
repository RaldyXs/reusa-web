"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contacto_controller_js_1 = require("../controllers/contacto.controller.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const contactoRouter = (0, express_1.Router)();
contactoRouter.use(auth_middleware_js_1.verificarToken);
contactoRouter.get("/articulo/:articuloId", contacto_controller_js_1.obtenerContacto);
exports.default = contactoRouter;
