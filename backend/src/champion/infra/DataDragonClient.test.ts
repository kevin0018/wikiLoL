import { afterEach, describe, expect, it, vi } from "vitest";
import { DataDragonClient } from "./DataDragonClient.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DataDragonClient", () => {
  it("resuelve el parche y devuelve contratos sin exponer la versión en assets", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(["26.14.1"]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              Aatrox: {
                id: "Aatrox",
                key: "266",
                name: "Aatrox",
                title: "la Espada de los Oscuros",
                tags: ["Fighter"],
                blurb: "Una leyenda caída.",
                image: { full: "Aatrox.png" },
              },
            },
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new DataDragonClient().getChampions("es_ES");

    expect(result.patch).toBe("26.14.1");
    expect(result.data[0]).toMatchObject({
      id: "Aatrox",
      imageUrl: "/api/assets/champion/Aatrox.png",
    });
    expect(result.data[0]?.imageUrl).not.toContain("26.14.1");
  });
});
