import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import app from "./index.js";

describe("API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the secondary splash source when Riot cannot serve the requested skin", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(new Uint8Array([255, 216, 255, 217]), {
        headers: { "Content-Type": "image/jpeg" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await request(app).get("/api/assets/skin/Aatrox/33.jpg");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/jpeg");
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_33.jpg",
      "https://cdn.communitydragon.org/latest/champion/aatrox/splash-art/skin/33",
    ]);
  });

  it("keeps missing Classic splashes retryable without using current artwork", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await request(app).get("/api/assets/skin/Jade_Aatrox/33.jpg");

    expect(response.status).toBe(404);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "https://ddragon.leagueoflegends.com/cdn/img/mode/classic/champion/splash/Jade_Aatrox_33.jpg",
    );
  });

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

  it("rechaza locales no soportados antes de consultar Data Dragon", async () => {
    const response = await request(app).get("/api/champions?locale=fr_FR");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
