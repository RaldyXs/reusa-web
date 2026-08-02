"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarSesion = iniciarSesion;
exports.registrarUsuario = registrarUsuario;
exports.solicitarRecuperacionContrasena = solicitarRecuperacionContrasena;
exports.restablecerContrasena = restablecerContrasena;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_crypto_1 = require("node:crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_js_1 = require("../repositories/auth.repository.js");
const correo_service_js_1 = require("./correo.service.js");
const MENSAJE_RECUPERACION = "Si existe una cuenta asociada a ese correo, recibirás un enlace para restablecer tu contraseña.";
function obtenerJwtSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("La variable JWT_SECRET no está configurada");
    }
    return jwtSecret;
}
function obtenerFrontendUrl() {
    const frontendUrl = process.env.FRONTEND_URL?.trim();
    if (!frontendUrl) {
        throw new Error("La variable FRONTEND_URL no está configurada");
    }
    return frontendUrl.replace(/\/+$/, "");
}
function normalizarTexto(valor) {
    return typeof valor === "string"
        ? valor.trim()
        : "";
}
function validarFormatoEmail(email) {
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patronEmail.test(email);
}
function crearHashToken(token) {
    return (0, node_crypto_1.createHash)("sha256")
        .update(token)
        .digest("hex");
}
function validarNuevaContrasena(contrasena, confirmarContrasena) {
    if (contrasena.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres");
    }
    if (contrasena !==
        confirmarContrasena) {
        throw new Error("Las contraseñas no coinciden");
    }
}
async function iniciarSesion(datos) {
    const email = typeof datos.email === "string"
        ? datos.email
            .trim()
            .toLowerCase()
        : "";
    const contrasena = typeof datos.contrasena ===
        "string"
        ? datos.contrasena
        : "";
    if (!email ||
        !contrasena) {
        throw new Error("El correo y la contraseña son obligatorios");
    }
    const usuario = await (0, auth_repository_js_1.buscarUsuarioPorEmail)(email);
    if (!usuario) {
        throw new Error("Correo o contraseña incorrectos");
    }
    if (Number(usuario.activo) !== 1) {
        throw new Error("Esta cuenta se encuentra desactivada");
    }
    const contrasenaCorrecta = await bcryptjs_1.default.compare(contrasena, usuario.contrasena);
    if (!contrasenaCorrecta) {
        throw new Error("Correo o contraseña incorrectos");
    }
    const usuarioSesion = {
        usuarioId: Number(usuario.usuario_id),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
    };
    const payload = {
        usuarioId: usuarioSesion.usuarioId,
        email: usuarioSesion.email,
        rol: usuarioSesion.rol,
    };
    const token = jsonwebtoken_1.default.sign(payload, obtenerJwtSecret(), {
        expiresIn: "8h",
    });
    return {
        token,
        usuario: usuarioSesion,
    };
}
async function registrarUsuario(entrada) {
    const nombre = normalizarTexto(entrada.nombre);
    const apellido = normalizarTexto(entrada.apellido);
    const email = normalizarTexto(entrada.email).toLowerCase();
    const contrasena = typeof entrada.contrasena ===
        "string"
        ? entrada.contrasena
        : "";
    const confirmarContrasena = typeof entrada.confirmarContrasena ===
        "string"
        ? entrada.confirmarContrasena
        : "";
    const telefono = normalizarTexto(entrada.telefono);
    const ubicacion = normalizarTexto(entrada.ubicacion);
    if (nombre.length < 2) {
        throw new Error("El nombre debe tener al menos 2 caracteres");
    }
    if (apellido.length < 2) {
        throw new Error("El apellido debe tener al menos 2 caracteres");
    }
    if (!email) {
        throw new Error("El correo electrónico es obligatorio");
    }
    if (!validarFormatoEmail(email)) {
        throw new Error("El correo electrónico no tiene un formato válido");
    }
    validarNuevaContrasena(contrasena, confirmarContrasena);
    if (!telefono) {
        throw new Error("El teléfono es obligatorio");
    }
    if (!ubicacion) {
        throw new Error("La ubicación es obligatoria");
    }
    const usuarioExistente = await (0, auth_repository_js_1.buscarUsuarioPorEmail)(email);
    if (usuarioExistente) {
        throw new Error("Ya existe un usuario registrado con ese correo");
    }
    const contrasenaCifrada = await bcryptjs_1.default.hash(contrasena, 12);
    const rol = "usuario";
    const usuarioId = await (0, auth_repository_js_1.crearUsuarioEnBaseDeDatos)({
        nombre,
        apellido,
        email,
        contrasena: contrasenaCifrada,
        telefono,
        ubicacion,
        rol,
    });
    const usuario = {
        usuarioId,
        nombre,
        apellido,
        email,
        rol,
    };
    return {
        usuario,
    };
}
async function solicitarRecuperacionContrasena(entrada) {
    const email = normalizarTexto(entrada.email).toLowerCase();
    if (!email ||
        !validarFormatoEmail(email)) {
        throw new Error("Debes indicar un correo electrónico válido");
    }
    const usuario = await (0, auth_repository_js_1.buscarUsuarioPorEmail)(email);
    /*
     * Se devuelve el mismo mensaje aunque el
     * correo no exista para no revelar qué
     * cuentas están registradas.
     */
    if (!usuario ||
        Number(usuario.activo) !== 1) {
        return {
            mensaje: MENSAJE_RECUPERACION,
        };
    }
    const token = (0, node_crypto_1.randomBytes)(32).toString("hex");
    const tokenHash = crearHashToken(token);
    const fechaExpiracion = new Date(Date.now() +
        60 * 60 * 1000);
    const tokenGuardado = await (0, auth_repository_js_1.guardarTokenRecuperacion)(Number(usuario.usuario_id), tokenHash, fechaExpiracion);
    if (!tokenGuardado) {
        throw new Error("No se pudo crear la solicitud de recuperación");
    }
    const enlaceRecuperacion = `${obtenerFrontendUrl()}` +
        `/restablecer-contrasena` +
        `?token=${encodeURIComponent(token)}`;
    try {
        await (0, correo_service_js_1.enviarCorreoRecuperacion)({
            destinatario: usuario.email,
            nombreUsuario: usuario.nombre,
            enlaceRecuperacion,
        });
    }
    catch (errorDesconocido) {
        await (0, auth_repository_js_1.invalidarTokenRecuperacion)(Number(usuario.usuario_id));
        console.error("Error al enviar el correo de recuperación:", errorDesconocido);
        throw new Error("No se pudo enviar el correo de recuperación");
    }
    return {
        mensaje: MENSAJE_RECUPERACION,
    };
}
async function restablecerContrasena(entrada) {
    const token = normalizarTexto(entrada.token);
    const contrasena = typeof entrada.contrasena ===
        "string"
        ? entrada.contrasena
        : "";
    const confirmarContrasena = typeof entrada.confirmarContrasena ===
        "string"
        ? entrada.confirmarContrasena
        : "";
    if (!token) {
        throw new Error("El enlace de recuperación no es válido");
    }
    validarNuevaContrasena(contrasena, confirmarContrasena);
    const tokenHash = crearHashToken(token);
    const usuario = await (0, auth_repository_js_1.buscarUsuarioPorTokenRecuperacion)(tokenHash);
    if (!usuario) {
        throw new Error("El enlace de recuperación no es válido o ha vencido");
    }
    const contrasenaCifrada = await bcryptjs_1.default.hash(contrasena, 12);
    const actualizada = await (0, auth_repository_js_1.actualizarContrasenaUsuario)(Number(usuario.usuario_id), contrasenaCifrada);
    if (!actualizada) {
        throw new Error("No se pudo actualizar la contraseña");
    }
    const tokenInvalidado = await (0, auth_repository_js_1.invalidarTokenRecuperacion)(Number(usuario.usuario_id));
    if (!tokenInvalidado) {
        console.error("La contraseña fue actualizada, pero no se pudo invalidar el token de recuperación");
    }
}
