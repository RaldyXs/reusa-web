"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPerfilUsuario = obtenerPerfilUsuario;
exports.actualizarPerfilUsuario = actualizarPerfilUsuario;
exports.cambiarContrasenaUsuario = cambiarContrasenaUsuario;
const bcrypt = require("bcrypt");
const cuenta_repository_js_1 = require("../repositories/cuenta.repository.js");
function validarIdentificador(valor, nombre) {
    if (!Number.isInteger(valor) ||
        valor <= 0) {
        throw new Error(`El identificador de ${nombre} no es válido`);
    }
}
function limpiarTextoObligatorio(valor, nombre, longitudMaxima) {
    if (typeof valor !== "string") {
        throw new Error(`${nombre} no es válido`);
    }
    const textoLimpio = valor.trim();
    if (!textoLimpio) {
        throw new Error(`${nombre} es obligatorio`);
    }
    if (textoLimpio.length >
        longitudMaxima) {
        throw new Error(`${nombre} no puede superar los ${longitudMaxima} caracteres`);
    }
    return textoLimpio;
}
function limpiarTextoOpcional(valor, nombre, longitudMaxima) {
    if (valor === undefined ||
        valor === null) {
        return null;
    }
    if (typeof valor !== "string") {
        throw new Error(`${nombre} no es válido`);
    }
    const textoLimpio = valor.trim();
    if (!textoLimpio) {
        return null;
    }
    if (textoLimpio.length >
        longitudMaxima) {
        throw new Error(`${nombre} no puede superar los ${longitudMaxima} caracteres`);
    }
    return textoLimpio;
}
function validarMostrarContacto(valor) {
    if (typeof valor === "boolean") {
        return valor;
    }
    if (valor === 1 ||
        valor === "1" ||
        valor === "true") {
        return true;
    }
    if (valor === 0 ||
        valor === "0" ||
        valor === "false") {
        return false;
    }
    throw new Error("La preferencia de contacto no es válida");
}
async function obtenerPerfilUsuario(usuarioId) {
    validarIdentificador(usuarioId, "usuario");
    const perfil = await (0, cuenta_repository_js_1.obtenerPerfilUsuarioDesdeBaseDeDatos)(usuarioId);
    if (!perfil) {
        throw new Error("El usuario indicado no existe");
    }
    return {
        ...perfil,
        activo: Number(perfil.activo),
        mostrar_contacto: Number(perfil.mostrar_contacto ?? 0),
    };
}
async function actualizarPerfilUsuario(usuarioId, nombre, apellido, telefono, ubicacion, mostrarContacto) {
    validarIdentificador(usuarioId, "usuario");
    const nombreLimpio = limpiarTextoObligatorio(nombre, "El nombre", 100);
    const apellidoLimpio = limpiarTextoObligatorio(apellido, "El apellido", 100);
    const telefonoLimpio = limpiarTextoOpcional(telefono, "El teléfono", 30);
    const ubicacionLimpia = limpiarTextoOpcional(ubicacion, "La ubicación", 200);
    const mostrarContactoValidado = validarMostrarContacto(mostrarContacto);
    const perfilActual = await (0, cuenta_repository_js_1.obtenerPerfilUsuarioDesdeBaseDeDatos)(usuarioId);
    if (!perfilActual) {
        throw new Error("El usuario indicado no existe");
    }
    const actualizado = await (0, cuenta_repository_js_1.actualizarPerfilUsuarioEnBaseDeDatos)(usuarioId, {
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        telefono: telefonoLimpio,
        ubicacion: ubicacionLimpia,
        mostrarContacto: mostrarContactoValidado,
    });
    if (!actualizado) {
        throw new Error("No se pudo actualizar el perfil");
    }
    return obtenerPerfilUsuario(usuarioId);
}
async function cambiarContrasenaUsuario(usuarioId, contrasenaActual, nuevaContrasena, confirmarContrasena) {
    validarIdentificador(usuarioId, "usuario");
    if (typeof contrasenaActual !==
        "string" ||
        !contrasenaActual) {
        throw new Error("La contraseña actual es obligatoria");
    }
    if (typeof nuevaContrasena !==
        "string" ||
        nuevaContrasena.length < 8) {
        throw new Error("La nueva contraseña debe tener al menos 8 caracteres");
    }
    if (nuevaContrasena.length > 255) {
        throw new Error("La nueva contraseña es demasiado larga");
    }
    if (nuevaContrasena ===
        contrasenaActual) {
        throw new Error("La nueva contraseña debe ser diferente de la actual");
    }
    if (nuevaContrasena !==
        confirmarContrasena) {
        throw new Error("Las contraseñas nuevas no coinciden");
    }
    const contrasenaGuardada = await (0, cuenta_repository_js_1.obtenerContrasenaUsuarioDesdeBaseDeDatos)(usuarioId);
    if (!contrasenaGuardada) {
        throw new Error("El usuario indicado no existe");
    }
    const contrasenaCorrecta = await bcrypt.compare(contrasenaActual, contrasenaGuardada);
    if (!contrasenaCorrecta) {
        throw new Error("La contraseña actual no es correcta");
    }
    const nuevaContrasenaHash = await bcrypt.hash(nuevaContrasena, 12);
    const actualizada = await (0, cuenta_repository_js_1.actualizarContrasenaUsuarioEnBaseDeDatos)(usuarioId, nuevaContrasenaHash);
    if (!actualizada) {
        throw new Error("No se pudo actualizar la contraseña");
    }
}
