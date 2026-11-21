import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import app from "./index.js";

describe("API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

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

  it.each([
    `/api/account/profile?gameName=${"a".repeat(33)}&tagLine=EUW&region=EUW`,
    `/api/account/rank?puuid=${"a".repeat(129)}&region=EUW`,
    "/api/account/activity/matches?puuid=player-id&region=EUW&start=1001",
  ])("rejects oversized input before calling Riot for %s", async (path) => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    expect((await request(app).get(path)).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("only grants cross-origin access to allowed origins", async () => {
    const allowed = await request(app).get("/api/unknown").set("Origin", "http://localhost:5173");
    const other = await request(app).get("/api/unknown").set("Origin", "https://other.example");

    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(other.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("returns Riot's retry delay and pauses upstream calls until it expires", async () => {
    vi.stubEnv("RIOT_API_KEY", "test-key");
    const startedAt = Date.now();
    const now = vi.spyOn(Date, "now").mockReturnValue(startedAt);
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 429, headers: { "Retry-After": "12" } }))
      .mockImplementation(async () => Response.json([]));
    vi.stubGlobal("fetch", fetchMock);
    const rankPath = "/api/account/rank?puuid=player&region=";

    const limited = await request(app).get(rankPath + "KR");
    expect(limited.status).toBe(429);
    expect(limited.headers["retry-after"]).toBe("12");
    expect(limited.headers["cache-control"]).toBe("no-store");

    now.mockReturnValue(startedAt + 5000);
    const blocked = await request(app).get(rankPath + "KR");
    expect(blocked.status).toBe(429);
    expect(blocked.headers["retry-after"]).toBe("7");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((await request(app).get(rankPath + "EUW")).status).toBe(200);

    now.mockReturnValue(startedAt + 12_000);
    expect((await request(app).get(rankPath + "KR")).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
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
