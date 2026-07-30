"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPerfilUsuarioDesdeBaseDeDatos = obtenerPerfilUsuarioDesdeBaseDeDatos;
exports.obtenerContrasenaUsuarioDesdeBaseDeDatos = obtenerContrasenaUsuarioDesdeBaseDeDatos;
exports.actualizarPerfilUsuarioEnBaseDeDatos = actualizarPerfilUsuarioEnBaseDeDatos;
exports.actualizarContrasenaUsuarioEnBaseDeDatos = actualizarContrasenaUsuarioEnBaseDeDatos;
const database_js_1 = require("../config/database.js");
async function obtenerPerfilUsuarioDesdeBaseDeDatos(usuarioId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          usuario_id,
          nombre,
          apellido,
          email,
          telefono,
          ubicacion,
          rol,
          activo,
          fecha_registro
        FROM usuarios
        WHERE usuario_id = ?
        LIMIT 1
      `, [usuarioId]);
    return filas[0] ?? null;
}
async function obtenerContrasenaUsuarioDesdeBaseDeDatos(usuarioId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT contrasena
        FROM usuarios
        WHERE usuario_id = ?
        LIMIT 1
      `, [usuarioId]);
    return filas[0]?.contrasena ?? null;
}
async function actualizarPerfilUsuarioEnBaseDeDatos(usuarioId, datos) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE usuarios
        SET
          nombre = ?,
          apellido = ?,
          telefono = ?,
          ubicacion = ?
        WHERE usuario_id = ?
      `, [
        datos.nombre,
        datos.apellido,
        datos.telefono,
        datos.ubicacion,
        usuarioId,
    ]);
    return resultado.affectedRows > 0;
}
async function actualizarContrasenaUsuarioEnBaseDeDatos(usuarioId, nuevaContrasenaHash) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE usuarios
        SET contrasena = ?
        WHERE usuario_id = ?
      `, [
        nuevaContrasenaHash,
        usuarioId,
    ]);
    return resultado.affectedRows > 0;
}
