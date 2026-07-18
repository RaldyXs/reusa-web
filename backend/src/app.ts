import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    ok: true,
    message: "API de Re-Usa Web funcionando correctamente",
  });
});

export default app;