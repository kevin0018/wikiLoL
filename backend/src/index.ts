import { pathToFileURL } from "node:url";
import cors from "cors";
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import { ZodError } from "zod";
import { createAccountRateLimit } from "./interfaces/accountRateLimit.js";
import { apiRouter } from "./interfaces/routes.js";
import { assetsRouter } from "./proxy/infra/RiotAssetsProxy.js";
import {
  RiotRateLimitError,
  UpstreamError,
  UpstreamPayloadError,
} from "./shared/http.js";

try {
  process.loadEnvFile();
} catch (error) {
  if (
    !(
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    )
  ) {
    throw error;
  }
}

const app = express();
const port = Number(process.env.PORT ?? 3000);

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigins, methods: ["GET", "HEAD"], exposedHeaders: ["Retry-After"] }));
app.use(["/api/account", "/api/league"], createAccountRateLimit());
app.use(express.json());
app.use("/api", apiRouter);
app.use("/api/assets", assetsRouter);

const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ error: "Ruta no encontrada." });
};

const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: error.issues[0]?.message ?? "Parámetros no válidos.",
    });
    return;
  }

  if (error instanceof RiotRateLimitError) {
    response.set({
      "Cache-Control": "no-store",
      "Retry-After": String(error.retryAfterSeconds),
    }).status(429).json({ error: "Riot ha limitado las solicitudes. Inténtalo de nuevo en unos segundos." });
    return;
  }

  if (error instanceof UpstreamError || error instanceof UpstreamPayloadError) {
    if (error instanceof UpstreamPayloadError) {
      console.error("Riot devolvió una respuesta inesperada", error.cause.issues);
    }
    const status =
      error instanceof UpstreamError && error.status === 404 ? 404 : 502;
    response.status(status).json({
      error: "Riot no ha podido completar la solicitud.",
    });
    return;
  }

  console.error(error);
  response.status(500).json({ error: "Error interno del servidor." });
};

app.use(notFound);
app.use(errorHandler);

const entryPath = process.argv[1];
if (
  process.env.VERCEL !== "1" &&
  entryPath &&
  import.meta.url === pathToFileURL(entryPath).href
) {
  app.listen(port, () => {
    console.log(`Backend disponible en http://localhost:${port}`);
  });
}

export default app;
