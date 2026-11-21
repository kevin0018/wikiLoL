import express from "express";
import request from "supertest";
import { afterEach, expect, it, vi } from "vitest";
import { createAccountRateLimit } from "./accountRateLimit.js";

afterEach(() => vi.restoreAllMocks());

it("limits account and league together, ignores forwarded addresses locally and resets", async () => {
  const now = vi.spyOn(Date, "now").mockReturnValue(60_000);
  const app = express();
  app.use(["/api/account", "/api/league"], createAccountRateLimit(false));
  app.use((_request, response) => { response.sendStatus(204); });

  for (let index = 0; index < 30; index += 1) {
    const result = await request(app).get("/api/account/profile");
    expect(result.status).toBe(204);
  }

  const blocked = await request(app).get("/api/league/challenger")
    .set("X-Vercel-Forwarded-For", "192.0.2.1");
  expect(blocked.status).toBe(429);
  expect(blocked.headers["retry-after"]).toBe("60");
  expect(blocked.headers["cache-control"]).toBe("no-store");
  expect((await request(app).get("/api/champions")).status).toBe(204);

  now.mockReturnValue(120_000);
  expect((await request(app).get("/api/league/challenger")).status).toBe(204);
});
