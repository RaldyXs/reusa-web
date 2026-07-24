"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarToken = verificarToken;
exports.permitirRoles = permitirRoles;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function obtenerJwtSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("La variable JWT_SECRET no está configurada");
    }
    return jwtSecret;
}
function verificarToken(request, response, next) {
    try {
        const autorizacion = request.headers.authorization;
        if (!autorizacion ||
            !autorizacion.startsWith("Bearer ")) {
            response.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para realizar esta acción",
            });
            return;
        }
        const token = autorizacion.slice(7).trim();
        const payload = jsonwebtoken_1.default.verify(token, obtenerJwtSecret());
        if (!payload.usuarioId ||
            !payload.email ||
            !payload.rol) {
            response.status(401).json({
                ok: false,
                message: "El token no es válido",
            });
            return;
        }
        request.usuario = payload;
        next();
    }
    catch {
        response.status(401).json({
            ok: false,
            message: "La sesión no es válida o ha expirado",
        });
    }
}
function permitirRoles(rolesPermitidos) {
    return (request, response, next) => {
        if (!request.usuario) {
            response.status(401).json({
                ok: false,
                message: "Debes iniciar sesión",
            });
            return;
        }
        if (!rolesPermitidos.includes(request.usuario.rol)) {
            response.status(403).json({
                ok: false,
                message: "No tienes permiso para realizar esta acción",
            });
            return;
        }
        next();
    };
}
