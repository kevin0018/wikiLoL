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
              Jade_Aatrox: {
                id: "Jade_Aatrox",
                key: "60266",
                name: "Aatrox",
                title: "la Espada de los Oscuros",
                tags: ["Fighter"],
                blurb: "La variante de LoL Classic.",
                image: { full: "Jade_Aatrox.png" },
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
    expect(result.data).toHaveLength(1);
    expect(result.data.some((champion) => champion.id.startsWith("Jade_"))).toBe(
      false,
    );
    expect(result.classic).toEqual([
      expect.objectContaining({
        id: "Jade_Aatrox",
        imageUrl: "/api/assets/champion/Jade_Aatrox.png",
      }),
    ]);
  });

  it("excluye LoL Classic del mapa de campeones usado por perfiles", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(["26.14.1"]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              Ahri: {
                id: "Ahri",
                key: "103",
                name: "Ahri",
                title: "la Vastaya de Nueve Colas",
                tags: ["Mage"],
                blurb: "Ahri manipula las emociones.",
                image: { full: "Ahri.png" },
              },
              Jade_Ahri: {
                id: "Jade_Ahri",
                key: "60103",
                name: "Ahri",
                title: "la Vastaya de Nueve Colas",
                tags: ["Mage"],
                blurb: "La variante de LoL Classic.",
                image: { full: "Jade_Ahri.png" },
              },
            },
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const client = new DataDragonClient();

    await expect(client.getChampionByNumericId(103, "es_ES")).resolves.toMatchObject(
      { id: "Ahri" },
    );
    await expect(
      client.getChampionByNumericId(60103, "es_ES"),
    ).rejects.toThrow("Campeón 60103 no encontrado.");
  });

  it("excluye los chromas que Data Dragon mezcla con las skins", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(["26.14.1"]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              Akali: {
                id: "Akali",
                key: "84",
                name: "Akali",
                title: "la Asesina Furtiva",
                tags: ["Assassin"],
                blurb: "Akali combate sola.",
                lore: "Akali ha renunciado a la orden Kinkou.",
                image: { full: "Akali.png" },
                skins: [
                  { num: 0, name: "default" },
                  { num: 14, name: "PROYECTO: Akali" },
                  {
                    num: 16,
                    name: "Proyecto: Akali (rubí)",
                    parentSkin: 14,
                  },
                  {
                    num: 17,
                    name: "PROYECTO: Akali (turquesa)",
                    parentSkin: 14,
                  },
                  { num: 82, name: "Akali empírea" },
                ],
              },
            },
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new DataDragonClient().getChampion("Akali", "es_ES");

    expect(result.skins.map((skin) => skin.name)).toEqual([
      "Aspecto original",
      "PROYECTO: Akali",
      "Akali empírea",
    ]);
  });

  it("excluye los chromas mediante parentSkin aunque parezcan una skin", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(["26.14.1"]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              LeeSin: {
                id: "LeeSin",
                key: "64",
                name: "Lee Sin",
                title: "el Monje Ciego",
                tags: ["Fighter"],
                blurb: "Lee Sin domina antiguas artes marciales.",
                image: { full: "LeeSin.png" },
                skins: [
                  { num: 0, name: "default" },
                  { num: 4, name: "Lee Sin puño de dragón" },
                  {
                    num: 5,
                    name: "Lee Sin puño de dragón - Duelo oscuro",
                    parentSkin: 4,
                  },
                  { num: 6, name: "Lee Sin noqueador" },
                ],
              },
            },
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new DataDragonClient().getChampion("LeeSin", "es_ES");

    expect(result.skins.map((skin) => skin.name)).toEqual([
      "Aspecto original",
      "Lee Sin puño de dragón",
      "Lee Sin noqueador",
    ]);
  });
});
