"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarSesion = iniciarSesion;
exports.registrarUsuario = registrarUsuario;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_js_1 = require("../repositories/auth.repository.js");
function obtenerJwtSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("La variable JWT_SECRET no está configurada");
    }
    return jwtSecret;
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
async function iniciarSesion(datos) {
    const email = typeof datos.email === "string"
        ? datos.email.trim().toLowerCase()
        : "";
    const contrasena = typeof datos.contrasena === "string"
        ? datos.contrasena
        : "";
    if (!email || !contrasena) {
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
    const contrasena = typeof entrada.contrasena === "string"
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
    if (contrasena.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres");
    }
    if (contrasena !==
        confirmarContrasena) {
        throw new Error("Las contraseñas no coinciden");
    }
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
