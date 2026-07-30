"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoria_controller_js_1 = require("../controllers/categoria.controller.js");
const categoriaRouter = (0, express_1.Router)();
categoriaRouter.get("/", categoria_controller_js_1.obtenerCategorias);
exports.default = categoriaRouter;
