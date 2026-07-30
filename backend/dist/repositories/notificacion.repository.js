"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearNotificacionEnBaseDeDatos = crearNotificacionEnBaseDeDatos;
exports.obtenerNotificacionesDesdeBaseDeDatos = obtenerNotificacionesDesdeBaseDeDatos;
exports.contarNotificacionesNoLeidasEnBaseDeDatos = contarNotificacionesNoLeidasEnBaseDeDatos;
exports.marcarNotificacionComoLeidaEnBaseDeDatos = marcarNotificacionComoLeidaEnBaseDeDatos;
exports.marcarTodasLasNotificacionesComoLeidasEnBaseDeDatos = marcarTodasLasNotificacionesComoLeidasEnBaseDeDatos;
const database_js_1 = require("../config/database.js");
async function crearNotificacionEnBaseDeDatos(datos) {
    const [resultado] = await database_js_1.pool.execute(`
        INSERT INTO notificaciones (
          usuario_id,
          tipo,
          titulo,
          mensaje,
          enlace
        )
        VALUES (?, ?, ?, ?, ?)
      `, [
        datos.usuarioId,
        datos.tipo,
        datos.titulo,
        datos.mensaje,
        datos.enlace ?? null,
    ]);
    return resultado.insertId;
}
async function obtenerNotificacionesDesdeBaseDeDatos(usuarioId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT
          notificacion_id,
          usuario_id,
          tipo,
          titulo,
          mensaje,
          enlace,
          leida,
          fecha_creacion
        FROM notificaciones
        WHERE usuario_id = ?
        ORDER BY fecha_creacion DESC
        LIMIT 50
      `, [usuarioId]);
    return filas;
}
async function contarNotificacionesNoLeidasEnBaseDeDatos(usuarioId) {
    const [filas] = await database_js_1.pool.execute(`
        SELECT COUNT(*) AS total
        FROM notificaciones
        WHERE usuario_id = ?
          AND leida = 0
      `, [usuarioId]);
    return Number(filas[0]?.total ?? 0);
}
async function marcarNotificacionComoLeidaEnBaseDeDatos(notificacionId, usuarioId) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE notificaciones
        SET leida = 1
        WHERE notificacion_id = ?
          AND usuario_id = ?
      `, [
        notificacionId,
        usuarioId,
    ]);
    return resultado.affectedRows > 0;
}
async function marcarTodasLasNotificacionesComoLeidasEnBaseDeDatos(usuarioId) {
    const [resultado] = await database_js_1.pool.execute(`
        UPDATE notificaciones
        SET leida = 1
        WHERE usuario_id = ?
          AND leida = 0
      `, [usuarioId]);
    return resultado.affectedRows;
}
