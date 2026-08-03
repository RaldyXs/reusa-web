import fs from "node:fs";

import mysql from "mysql2/promise";

const usarSsl =
  process.env.DB_SSL === "true";

const rutaCertificado =
  process.env.DB_SSL_CA_PATH;

const certificadoCa =
  usarSsl &&
  rutaCertificado
    ? fs.readFileSync(
        rutaCertificado,
        "utf8",
      )
    : undefined;

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port:
    Number(
      process.env.DB_PORT,
    ) || 3306,
  user: process.env.DB_USER,
  password:
    process.env.DB_PASSWORD,
  database:
    process.env.DB_NAME,

  ssl: usarSsl
    ? {
        rejectUnauthorized:
          true,
        ca: certificadoCa,
      }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function verificarConexion(): Promise<void> {
  const connection =
    await pool.getConnection();

  try {
    await connection.ping();

    console.log(
      "Conexión con MySQL establecida correctamente",
    );
  } finally {
    connection.release();
  }
}