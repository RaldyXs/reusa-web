"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subirImagenMensaje = exports.subirImagenesArticulo = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const carpetaArticulos = node_path_1.default.resolve(process.cwd(), "uploads", "articulos");
const carpetaMensajes = node_path_1.default.resolve(process.cwd(), "uploads", "mensajes");
node_fs_1.default.mkdirSync(carpetaArticulos, {
    recursive: true,
});
node_fs_1.default.mkdirSync(carpetaMensajes, {
    recursive: true,
});
const tiposPermitidos = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);
function crearNombreArchivo(nombreOriginal) {
    const extension = node_path_1.default
        .extname(nombreOriginal)
        .toLowerCase();
    const nombreUnico = [
        Date.now(),
        Math.round(Math.random() *
            1_000_000_000),
    ].join("-");
    return `${nombreUnico}${extension}`;
}
function validarImagen(file, callback) {
    if (!tiposPermitidos.has(file.mimetype)) {
        callback(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
        return;
    }
    callback(null, true);
}
const almacenamientoArticulos = multer_1.default.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, carpetaArticulos);
    },
    filename: (_request, file, callback) => {
        callback(null, crearNombreArchivo(file.originalname));
    },
});
const almacenamientoMensajes = multer_1.default.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, carpetaMensajes);
    },
    filename: (_request, file, callback) => {
        callback(null, crearNombreArchivo(file.originalname));
    },
});
exports.subirImagenesArticulo = (0, multer_1.default)({
    storage: almacenamientoArticulos,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
    fileFilter: (_request, file, callback) => {
        validarImagen(file, callback);
    },
}).array("imagenes", 5);
exports.subirImagenMensaje = (0, multer_1.default)({
    storage: almacenamientoMensajes,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (_request, file, callback) => {
        validarImagen(file, callback);
    },
}).single("imagen");
