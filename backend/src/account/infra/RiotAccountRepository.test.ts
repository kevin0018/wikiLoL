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

  it("retries missing identities and preserves standings when a profile icon fails", async () => {
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
    const identity = { puuid: "player-puuid", gameName: "J1HUIV", tagLine: "000" };
    const summoner = { puuid: "player-puuid", profileIconId: 123, summonerLevel: 200 };
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(league))
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(Response.json(summoner))
      .mockResolvedValueOnce(Response.json(league))
      .mockResolvedValueOnce(Response.json(identity))
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(Response.json(league))
      .mockResolvedValueOnce(Response.json(summoner));
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
    expect(unresolved[0]?.iconUrl).toBe("/api/assets/profile-icon/123.png");
    expect(resolved[0]?.iconUrl).toBeUndefined();
    expect(cached[0]?.iconUrl).toBe("/api/assets/profile-icon/123.png");
    expect(fetchMock).toHaveBeenCalledTimes(8);
  });
});
