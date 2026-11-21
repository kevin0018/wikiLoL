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
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
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

    expect(fetchMock).toHaveBeenCalledWith(
      "https://ddragon.leagueoflegends.com/cdn/26.14.1/data/es_ES/mode/classic/champion.json",
      undefined,
    );
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

  it.each([403, 404])("mantiene el catálogo actual si Classic devuelve %s", async (status) => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(["16.23.1"]))
      .mockResolvedValueOnce(Response.json({
        data: {
          Ahri: {
            id: "Ahri",
            name: "Ahri",
            image: { full: "Ahri.png" },
          },
        },
      }))
      .mockResolvedValueOnce(new Response(null, { status }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(new DataDragonClient().getChampions()).resolves.toMatchObject({
      data: [{ id: "Ahri" }],
      classic: [],
    });
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

  it("mantiene una caché independiente para cada locale", async () => {
    const champion = (name: string) => ({
      data: {
        Ahri: {
          id: "Ahri",
          key: "103",
          name,
          title: "title",
          tags: ["Mage"],
          blurb: "lore",
          image: { full: "Ahri.png" },
        },
      },
    });
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(["26.14.1"]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(champion("Ahri EN")), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(champion("Ahri ES")), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const client = new DataDragonClient();

    await expect(
      client.getChampionByNumericId(103, "en_US"),
    ).resolves.toMatchObject({ name: "Ahri EN" });
    await expect(
      client.getChampionByNumericId(103, "es_ES"),
    ).resolves.toMatchObject({ name: "Ahri ES" });
  });

  it("separates Classic ability notes from archived lore and filters the historical skin gallery", async () => {
    const classic = {
      id: "Jade_Corki", key: "60042", name: "Corki", title: "The Daring Bombardier",
      image: { full: "Jade_Corki.png" }, tags: ["Marksman"],
      lore: "- Phosphorus Bomb is instant.<br/>- Missile Barrage is different.",
      skins: [
        { num: 0, name: "default" },
        { num: 1, name: "UFO Corki" },
        { num: 5, name: "Urfrider Corki" },
        { num: 6, name: "Dragonwing Corki" },
        { num: 8, name: "Arcade Corki" },
        { num: 18, name: "Corgi Corki" },
        { num: 26, name: "Astronaut Corki" },
      ],
    };
    const archive = {
      lore: "Corki joined the Screaming Yipsnakes.<br><br>He took to the skies.",
      skins: [0, 1, 2, 5, 6].map((num) => ({ num })),
    };
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(["16.23.1"]))
      .mockResolvedValueOnce(Response.json({ data: { Jade_Corki: classic } }))
      .mockResolvedValueOnce(Response.json({ data: { Corki: archive } }))
      .mockResolvedValueOnce(Response.json({ data: { Jade_Corki: classic } }));
    vi.stubGlobal("fetch", fetchMock);
    const client = new DataDragonClient();

    const result = await client.getChampion("Jade_Corki", "en_US");

    expect(result.lore).toBe("Corki joined the Screaming Yipsnakes.\n\nHe took to the skies.");
    expect(result.classicNotes).toEqual(["Phosphorus Bomb is instant.", "Missile Barrage is different."]);
    expect(result.skins.map(({ num }) => num)).toEqual([0, 1, 5, 6]);
    expect(result.skins[0]?.imageUrl).toBe("/api/assets/skin/Jade_Corki/0.jpg");
    expect(result.skins[2]?.imageUrl).toBe("/images/classic/5.24.1/Corki_5.jpg");
    await expect(client.getChampion("Jade_Corki", "en_US")).resolves.toEqual(result);
    expect(fetchMock.mock.calls.map(([url]) => url).filter((url) => String(url).includes("/5.24.1/"))).toEqual([
      "https://ddragon.leagueoflegends.com/cdn/5.24.1/data/en_US/champion/Corki.json",
    ]);
  });

  it.each([
    { name: "Sona", native: [0], archived: [] },
    { name: "Janna", native: [0], archived: [1] },
    { name: "Akali", native: [301], archived: [5] },
    { name: "Mordekaiser", native: [0, 2], archived: [1] },
  ])("selects the historical splash source for each $name skin", async ({ name, native, archived }) => {
    const id = `Jade_${name}`;
    const skins = [...native, ...archived].map((num) => ({ num, name: num === 0 ? "default" : `Skin ${num}` }));
    const classic = {
      id, key: "60037", name, title: "Champion title",
      image: { full: `${id}.png` }, tags: ["Support"], blurb: "Classic ability notes.", skins,
    };
    vi.stubGlobal("fetch", vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(["16.23.1"]))
      .mockResolvedValueOnce(Response.json({ data: { [id]: classic } }))
      .mockResolvedValueOnce(Response.json({ data: { [name]: { skins } } })));

    const result = await new DataDragonClient().getChampion(id, "en_US");

    expect(Object.fromEntries(result.skins.map(({ num, imageUrl }) => [num, imageUrl]))).toEqual(
      Object.fromEntries([
        ...native.map((num) => [num, `/api/assets/skin/${id}/${num}.jpg`]),
        ...archived.map((num) => [num, `/images/classic/5.24.1/${name}_${num}.jpg`]),
      ]),
    );
  });

  it.each([true, false])("prefers the official Classic base with archive available = %s", async (available) => {
    const classic = {
      id: "Jade_Lux", key: "60099", name: "Lux", title: "the Lady of Luminosity",
      image: { full: "Jade_Lux.png" }, tags: ["Mage"], blurb: "- Different ability.",
      skins: [
        { num: 0, name: "default" },
        { num: 1, name: "Historical Lux" },
        { num: 15, name: "Modern Lux" },
        { num: 302, name: "Classic Lux" },
        { num: 303, name: "Classic Lux chroma", parentSkin: 302 },
      ],
    };
    vi.stubGlobal("fetch", vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(["16.23.1"]))
      .mockResolvedValueOnce(Response.json({ data: { Jade_Lux: classic } }))
      .mockResolvedValueOnce(available
        ? Response.json({ data: { Lux: { lore: "Archived history.", skins: [{ num: 1 }] } } })
        : new Response(null, { status: 403 })));

    const result = await new DataDragonClient().getChampion("Jade_Lux", "en_US");

    expect(result.lore).toBe(available ? "Archived history." : "");
    expect(result.classicNotes).toEqual(["Different ability."]);
    expect(result.skins.map(({ num }) => num)).toEqual(available ? [302, 1] : [302]);
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
