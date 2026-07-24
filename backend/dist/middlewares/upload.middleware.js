"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subirImagenesArticulo = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const carpetaImagenes = node_path_1.default.resolve(process.cwd(), "uploads", "articulos");
node_fs_1.default.mkdirSync(carpetaImagenes, {
    recursive: true,
});
const almacenamiento = multer_1.default.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, carpetaImagenes);
    },
    filename: (_request, file, callback) => {
        const extension = node_path_1.default
            .extname(file.originalname)
            .toLowerCase();
        const nombreUnico = [
            Date.now(),
            Math.round(Math.random() * 1_000_000_000),
        ].join("-");
        callback(null, `${nombreUnico}${extension}`);
    },
});
const tiposPermitidos = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);
exports.subirImagenesArticulo = (0, multer_1.default)({
    storage: almacenamiento,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
    fileFilter: (_request, file, callback) => {
        if (!tiposPermitidos.has(file.mimetype)) {
            callback(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
            return;
        }
        callback(null, true);
    },
}).array("imagenes", 5);
