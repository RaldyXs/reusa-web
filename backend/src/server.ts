import "dotenv/config";
import app from "./app.js";
import { verificarConexion } from "./config/database.js";

const PORT = Number(process.env.PORT) || 3000;

async function iniciarServidor(): Promise<void> {
  try {
    await verificarConexion();

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo conectar con MySQL:", error);
    process.exit(1);
  }
}

void iniciarServidor();