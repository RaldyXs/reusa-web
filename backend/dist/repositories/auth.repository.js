"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarUsuarioPorEmail = buscarUsuarioPorEmail;
exports.crearUsuarioEnBaseDeDatos = crearUsuarioEnBaseDeDatos;
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
