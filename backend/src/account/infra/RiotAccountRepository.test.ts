import { afterEach, describe, expect, it, vi } from "vitest";
import { QueueType } from "../domain/value-object/QueueType.js";
import { Region } from "../domain/value-object/Region.js";
import { RiotAccountRepository } from "./RiotAccountRepository.js";

const originalApiKey = process.env.RIOT_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalApiKey === undefined) {
    delete process.env.RIOT_API_KEY;
  } else {
    process.env.RIOT_API_KEY = originalApiKey;
  }
});

describe("RiotAccountRepository", () => {
  it("devuelve una lista vacía cuando no hay partidas recientes", async () => {
    process.env.RIOT_API_KEY = "test-key";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const repository = new RiotAccountRepository();

    await expect(
      repository.getMostPlayed(
        "player-without-matches",
        Region.from("EUW"),
        20,
        4,
      ),
    ).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reintenta identidades fallidas y conserva las resueltas en caché", async () => {
    process.env.RIOT_API_KEY = "test-key";
    const league = {
      entries: [
        {
          puuid: "player-puuid",
          leaguePoints: 4334,
          wins: 980,
          losses: 833,
        },
      ],
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(league), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response("", { status: 429 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(league), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            puuid: "player-puuid",
            gameName: "J1HUIV",
            tagLine: "000",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(league), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const repository = new RiotAccountRepository();
    const region = Region.from("EUW");
    const queue = QueueType.from("RANKED_SOLO_5x5");

    const unresolved = await repository.getChallenger(region, queue, 1);
    const resolved = await repository.getChallenger(region, queue, 1);
    const cached = await repository.getChallenger(region, queue, 1);

    expect(unresolved[0]?.riotIdForDisplay).toBe("Riot ID no disponible");
    expect(resolved[0]?.riotIdForDisplay).toBe("J1HUIV#000");
    expect(cached[0]?.riotIdForDisplay).toBe("J1HUIV#000");
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
});
