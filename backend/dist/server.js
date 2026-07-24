"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_js_1 = __importDefault(require("./app.js"));
const database_js_1 = require("./config/database.js");
const PORT = Number(process.env.PORT) || 3000;
async function iniciarServidor() {
    try {
        await (0, database_js_1.verificarConexion)();
        app_js_1.default.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("No se pudo conectar con MySQL:", error);
        process.exit(1);
    }
}
void iniciarServidor();
