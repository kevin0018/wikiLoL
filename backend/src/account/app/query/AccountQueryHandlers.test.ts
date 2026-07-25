import { describe, expect, it, vi } from "vitest";
import { GetAccountProfileHandler } from "./GetAccountProfileHandler.js";
import { GetAccountProfileQuery } from "./GetAccountProfileQuery.js";
import { GetAccountRankHandler } from "./GetAccountRankHandler.js";
import { GetAccountRankQuery } from "./GetAccountRankQuery.js";
import { GetChallengerLeagueHandler } from "./GetChallengerLeagueHandler.js";
import { GetChallengerLeagueQuery } from "./GetChallengerLeagueQuery.js";
import { GetChampionMasteryHandler } from "./GetChampionMasteryHandler.js";
import { GetChampionMasteryQuery } from "./GetChampionMasteryQuery.js";
import { GetMostPlayedChampionHandler } from "./GetMostPlayedChampionHandler.js";
import { GetMostPlayedChampionQuery } from "./GetMostPlayedChampionQuery.js";

describe("account query handlers", () => {
  it("delega la consulta de perfil en su puerto", async () => {
    const profile = {
      gameName: "Faker",
      tagLine: "KR1",
      puuid: "puuid",
      summonerId: "summoner",
      summonerLevel: 500,
      region: "KR" as const,
      iconUrl: "/api/assets/profile-icon/1.png",
    };
    const getProfile = vi.fn().mockResolvedValue(profile);
    const handler = new GetAccountProfileHandler({ getProfile });

    await expect(
      handler.execute(new GetAccountProfileQuery("Faker", "KR1", "KR")),
    ).resolves.toEqual(profile);
    expect(getProfile).toHaveBeenCalledWith("Faker", "KR1", "KR");
  });

  it("delega rango, maestría y campeones recientes con sus límites", async () => {
    const getRanks = vi.fn().mockResolvedValue([]);
    const getMastery = vi.fn().mockResolvedValue([]);
    const getMostPlayed = vi.fn().mockResolvedValue([]);

    await new GetAccountRankHandler({ getRanks }).execute(
      new GetAccountRankQuery("summoner", "EUW"),
    );
    await new GetChampionMasteryHandler({ getMastery }).execute(
      new GetChampionMasteryQuery("puuid", "EUW", 6),
    );
    await new GetMostPlayedChampionHandler({ getMostPlayed }).execute(
      new GetMostPlayedChampionQuery("puuid", "EUW", 30, 5),
    );

    expect(getRanks).toHaveBeenCalledWith("summoner", "EUW");
    expect(getMastery).toHaveBeenCalledWith("puuid", "EUW", 6);
    expect(getMostPlayed).toHaveBeenCalledWith("puuid", "EUW", 30, 5);
  });

  it("delega la clasificación Challenger", async () => {
    const getChallenger = vi.fn().mockResolvedValue([]);
    const handler = new GetChallengerLeagueHandler({ getChallenger });

    await handler.execute(
      new GetChallengerLeagueQuery("EUW", "RANKED_SOLO_5x5", 5),
    );

    expect(getChallenger).toHaveBeenCalledWith(
      "EUW",
      "RANKED_SOLO_5x5",
      5,
    );
  });
});
