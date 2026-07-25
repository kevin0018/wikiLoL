import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "./index.js";

describe("API", () => {
  it("valida los contratos de entrada antes de contactar con Riot", async () => {
    const response = await request(app).get(
      "/api/account/profile?gameName=Faker&tagLine=KR1&region=INVALID",
    );

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("devuelve un error JSON para rutas desconocidas", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Ruta no encontrada." });
  });
});
