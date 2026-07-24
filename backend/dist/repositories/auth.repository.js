"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarUsuarioPorEmail = buscarUsuarioPorEmail;
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
