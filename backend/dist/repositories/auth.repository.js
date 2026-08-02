"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarUsuarioPorEmail = buscarUsuarioPorEmail;
exports.crearUsuarioEnBaseDeDatos = crearUsuarioEnBaseDeDatos;
exports.guardarTokenRecuperacion = guardarTokenRecuperacion;
exports.buscarUsuarioPorTokenRecuperacion = buscarUsuarioPorTokenRecuperacion;
exports.actualizarContrasenaUsuario = actualizarContrasenaUsuario;
exports.invalidarTokenRecuperacion = invalidarTokenRecuperacion;
const database_js_1 = require("../config/database.js");
async function buscarUsuarioPorEmail(email) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          usuario_id,
          nombre,
          apellido,
          email,
          contrasena,
          telefono,
          ubicacion,
          rol,
          activo
        FROM usuarios
        WHERE email = ?
        LIMIT 1
      `, [email]);
    return filas[0] ?? null;
}
async function crearUsuarioEnBaseDeDatos(datos) {
    const [resultado] = await database_js_1.pool.execute(`
        INSERT INTO usuarios (
          nombre,
          apellido,
          email,
          contrasena,
          telefono,
          ubicacion,
          rol,
          activo
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          1
        )
      `, [
        datos.nombre,
        datos.apellido,
        datos.email,
        datos.contrasena,
        datos.telefono,
        datos.ubicacion,
        datos.rol,
    ]);
    return resultado.insertId;
}
async function guardarTokenRecuperacion(usuarioId, tokenHash, fechaExpiracion) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE usuarios
        SET
          token_recuperacion_hash = ?,
          token_recuperacion_expira = ?
        WHERE usuario_id = ?
          AND activo = 1
      `, [
        tokenHash,
        fechaExpiracion,
        usuarioId,
    ]);
    return resultado.affectedRows > 0;
}
async function buscarUsuarioPorTokenRecuperacion(tokenHash) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          usuario_id,
          nombre,
          apellido,
          email,
          activo,
          token_recuperacion_expira
        FROM usuarios
        WHERE token_recuperacion_hash = ?
          AND token_recuperacion_expira IS NOT NULL
          AND token_recuperacion_expira > NOW()
          AND activo = 1
        LIMIT 1
      `, [tokenHash]);
    return filas[0] ?? null;
}
async function actualizarContrasenaUsuario(usuarioId, contrasenaCifrada) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE usuarios
        SET contrasena = ?
        WHERE usuario_id = ?
          AND activo = 1
      `, [
        contrasenaCifrada,
        usuarioId,
    ]);
    return resultado.affectedRows > 0;
}
async function invalidarTokenRecuperacion(usuarioId) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE usuarios
        SET
          token_recuperacion_hash = NULL,
          token_recuperacion_expira = NULL
        WHERE usuario_id = ?
      `, [usuarioId]);
    return resultado.affectedRows > 0;
}
