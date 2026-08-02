"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
const articulo_routes_js_1 = __importDefault(require("./routes/articulo.routes.js"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const categoria_routes_js_1 = __importDefault(require("./routes/categoria.routes.js"));
const contacto_routes_js_1 = __importDefault(require("./routes/contacto.routes.js"));
const cuenta_routes_js_1 = __importDefault(require("./routes/cuenta.routes.js"));
const favorito_routes_js_1 = __importDefault(require("./routes/favorito.routes.js"));
const mensaje_routes_js_1 = __importDefault(require("./routes/mensaje.routes.js"));
const notificacion_routes_js_1 = __importDefault(require("./routes/notificacion.routes.js"));
const oferta_routes_js_1 = __importDefault(require("./routes/oferta.routes.js"));
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
app.use("/api/categorias", categoria_routes_js_1.default);
app.use("/api/favoritos", favorito_routes_js_1.default);
app.use("/api/admin", admin_routes_js_1.default);
app.use("/api/ofertas", oferta_routes_js_1.default);
app.use("/api/cuenta", cuenta_routes_js_1.default);
app.use("/api/contactos", contacto_routes_js_1.default);
app.use("/api/notificaciones", notificacion_routes_js_1.default);
app.use("/api/mensajes", mensaje_routes_js_1.default);
app.use((error, _request, response, next) => {
    if (error instanceof
        multer_1.default.MulterError) {
        let mensaje = "No se pudo procesar la imagen";
        if (error.code ===
            "LIMIT_FILE_SIZE") {
            mensaje =
                "La imagen no puede superar los 5 MB";
        }
        if (error.code ===
            "LIMIT_FILE_COUNT") {
            mensaje =
                "Solo puedes enviar una imagen por mensaje";
        }
        if (error.code ===
            "LIMIT_UNEXPECTED_FILE") {
            mensaje =
                "El archivo enviado no es válido";
        }
        response.status(400).json({
            ok: false,
            message: mensaje,
        });
        return;
    }
    if (error instanceof Error) {
        console.error("Error no controlado:", error);
        response.status(400).json({
            ok: false,
            message: error.message,
        });
        return;
    }
    next(error);
});
exports.default = app;
