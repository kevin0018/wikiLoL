import { describe, expect, it, vi } from "vitest";
import { GetChampionByIdHandler } from "./GetChampionByIdHandler.js";
import { GetChampionByIdQuery } from "./GetChampionByIdQuery.js";
import { GetChampionDataHandler } from "./GetChampionDataHandler.js";
import { GetChampionDataQuery } from "./GetChampionDataQuery.js";

describe("champion query handlers", () => {
  it("delega el archivo de campeones con el locale", async () => {
    const response = { data: [], classic: [], patch: "16.14.1" };
    const getChampions = vi.fn().mockResolvedValue(response);
    const handler = new GetChampionDataHandler({ getChampions });

    await expect(
      handler.execute(new GetChampionDataQuery("es_ES")),
    ).resolves.toEqual(response);
    expect(getChampions).toHaveBeenCalledWith("es_ES");
  });

  it("delega el detalle por id", async () => {
    const champion = {
      id: "Aatrox",
      name: "Aatrox",
      title: "la Espada de los Oscuros",
      roles: ["Fighter" as const],
      lore: "Lore",
      imageUrl: "/api/assets/champion/Aatrox.png",
      skins: [],
    };
    const getChampion = vi.fn().mockResolvedValue(champion);
    const handler = new GetChampionByIdHandler({ getChampion });

    await expect(
      handler.execute(new GetChampionByIdQuery("Aatrox")),
    ).resolves.toEqual(champion);
    expect(getChampion).toHaveBeenCalledWith("Aatrox", "es_ES");
  });
});
