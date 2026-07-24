"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const articulo_routes_js_1 = __importDefault(require("./routes/articulo.routes.js"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const app = (0, express_1.default)();
const carpetaUploads = node_path_1.default.resolve(__dirname, "..", "uploads");
console.log("Carpeta pública de imágenes:", carpetaUploads);
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
}));
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(carpetaUploads));
app.get("/api/health", (_request, response) => {
    response.status(200).json({
        ok: true,
        message: "API de Re-Usa Web funcionando correctamente",
    });
});
app.use("/api/auth", auth_routes_js_1.default);
app.use("/api/articulos", articulo_routes_js_1.default);
exports.default = app;
