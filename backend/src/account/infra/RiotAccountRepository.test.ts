import { afterEach, describe, expect, it, vi } from "vitest";
import { DataDragonClient } from "../../champion/infra/DataDragonClient.js";
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

  it("reuses the same match payloads for history, most played champions, and scoreboards", async () => {
    process.env.RIOT_API_KEY = "test-key";
    const matchIds = Array.from({ length: 6 }, (_, index) => `EUW1_${index + 1}`);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(matchIds));
    for (const id of matchIds) {
      fetchMock.mockResolvedValueOnce(Response.json({
        info: {
          gameDuration: 1700, gameStartTimestamp: 1234, queueId: 420, gameVersion: "16.23.4.123",
          teams: [{ teamId: 100, win: true }, { teamId: 200, win: false }],
          participants: [
            { puuid: "player", championId: 103, win: id !== "EUW1_2", kills: 7, largestMultiKill: id === "EUW1_2" ? 5 : undefined, deaths: 2, assists: 9, teamId: 100, item0: 3157, riotIdGameName: "Kaori", totalDamageDealtToChampions: 32050, goldEarned: 14500, totalMinionsKilled: 180, neutralMinionsKilled: 20 },
            { puuid: "teammate", championId: 103, kills: 13, teamId: 100 },
            { puuid: "opponent", championId: 103, kills: 2, teamId: 200 },
          ],
        },
      }));
    }
    vi.stubGlobal("fetch", fetchMock);
    const dataDragon = new DataDragonClient();
    vi.spyOn(dataDragon, "getChampionByNumericId").mockResolvedValue({
      id: "Ahri", key: "103", name: "Ahri", title: "", tags: [], blurb: "", image: { full: "Ahri.png" },
    });
    vi.spyOn(dataDragon, "getItemNames").mockResolvedValue(new Map([["3157", "Zhonya"]]));
    const repository = new RiotAccountRepository(dataDragon);
    const region = Region.from("EUW");

    const result = await repository.getActivity("player", region, "es_ES");
    expect(result.matches.map(({ matchId }) => matchId)).toEqual(matchIds);
    expect(result.nextStart).toBeNull();
    expect(result.matches[0]?.largestMultiKill).toBe(0);
    expect(result.matches[1]).toMatchObject({
      win: false, championName: "Ahri", kills: 7, largestMultiKill: 5, deaths: 2, assists: 9, queueId: 420, durationSeconds: 1700,
      farm: 200, killParticipation: 80,
      itemImageUrls: ["/api/assets/item/16.23.1/3157.png", null, null, null, null, null, null],
    });
    expect(result.mostPlayed).toEqual([expect.objectContaining({ championName: "Ahri", gamesPlayed: 6 })]);
    await expect(repository.getMostPlayed("player", region, 20, 4, "en_US")).resolves.toEqual(result.mostPlayed);
    const detail = await repository.getMatchDetails("EUW1_1", region, "es_ES");
    expect(detail.teams).toMatchObject([
      { teamId: 100, win: true, kills: 20, players: [{ playerName: "Kaori", damage: 32050, gold: 14500, farm: 200, items: [
        { name: "Zhonya", imageUrl: "/api/assets/item/16.23.1/3157.png" }, null, null, null, null, null, null,
      ] }, { kills: 13 }] },
      { teamId: 200, win: false, kills: 2, players: [{ damage: null, gold: null, farm: null }] },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(7);
  });

  it("requests older history by offset and reuses cached match payloads across pages", async () => {
    process.env.RIOT_API_KEY = "test-key";
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(["EUW1_1"]))
      .mockResolvedValueOnce(Response.json({ info: { participants: [{ puuid: "player", championId: 103 }] } }))
      .mockResolvedValueOnce(Response.json(["EUW1_1"]));
    vi.stubGlobal("fetch", fetchMock);
    const dataDragon = new DataDragonClient();
    vi.spyOn(dataDragon, "getChampionByNumericId").mockResolvedValue({
      id: "Ahri", key: "103", name: "Ahri", title: "", tags: [], blurb: "", image: { full: "Ahri.png" },
    });
    const repository = new RiotAccountRepository(dataDragon);
    const region = Region.from("EUW");

    const initial = await repository.getActivity("player", region, "es_ES");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const page = await repository.getActivityPage("player", region, "es_ES", 20);

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      expect.stringContaining("/ids?start=0&count=20"),
      expect.stringContaining("/matches/EUW1_1"),
      expect.stringContaining("/ids?start=20&count=20"),
    ]);
    expect(page).toEqual({ matches: initial.matches, nextStart: null });
    await expect(repository.getActivityPage("player", region, "es_ES", 20)).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledTimes(3);
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
