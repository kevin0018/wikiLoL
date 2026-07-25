import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { fetchJson, UpstreamPayloadError } from "./http.js";

describe("fetchJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("distingue una respuesta inválida del proveedor de una entrada inválida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ puuid: "player" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(
      fetchJson("https://upstream.test", undefined, z.object({ id: z.string() })),
    ).rejects.toBeInstanceOf(UpstreamPayloadError);
  });
});
