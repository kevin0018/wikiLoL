import { pathToFileURL } from "node:url";
import cors from "cors";
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import { ZodError } from "zod";
import { apiRouter } from "./interfaces/routes.js";
import { assetsRouter } from "./proxy/infra/RiotAssetsProxy.js";
import {
  errorMessage,
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

app.use(cors());
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
  response.status(500).json({ error: errorMessage(error) });
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
