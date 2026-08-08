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
import { QueueType } from "../../domain/value-object/QueueType.js";
import { Region } from "../../domain/value-object/Region.js";

describe("account query handlers", () => {
  it("delega la consulta de perfil en su puerto", async () => {
    const profile = {
      gameName: "Faker",
      tagLine: "KR1",
      puuid: "puuid",
      summonerLevel: 500,
      region: "KR" as const,
      iconUrl: "/api/assets/profile-icon/1.png",
    };
    const getProfile = vi.fn().mockResolvedValue(profile);
    const handler = new GetAccountProfileHandler({ getProfile });
    const region = Region.from("KR");

    await expect(
      handler.execute(new GetAccountProfileQuery("Faker", "KR1", region)),
    ).resolves.toEqual(profile);
    expect(getProfile).toHaveBeenCalledWith("Faker", "KR1", region);
  });

  it("delega rango, maestría y campeones recientes con sus límites", async () => {
    const getRanks = vi.fn().mockResolvedValue([]);
    const getMastery = vi.fn().mockResolvedValue([]);
    const getMostPlayed = vi.fn().mockResolvedValue([]);
    const region = Region.from("EUW");

    await new GetAccountRankHandler({ getRanks }).execute(
      new GetAccountRankQuery("puuid", region),
    );
    await new GetChampionMasteryHandler({ getMastery }).execute(
      new GetChampionMasteryQuery("puuid", region, 6, "en_US"),
    );
    await new GetMostPlayedChampionHandler({ getMostPlayed }).execute(
      new GetMostPlayedChampionQuery("puuid", region, 30, 5, "en_US"),
    );

    expect(getRanks).toHaveBeenCalledWith("puuid", region);
    expect(getMastery).toHaveBeenCalledWith("puuid", region, 6, "en_US");
    expect(getMostPlayed).toHaveBeenCalledWith(
      "puuid",
      region,
      30,
      5,
      "en_US",
    );
  });

  it("delega la clasificación Challenger", async () => {
    const getChallenger = vi.fn().mockResolvedValue([]);
    const handler = new GetChallengerLeagueHandler({ getChallenger });
    const region = Region.from("EUW");
    const queue = QueueType.from("RANKED_SOLO_5x5");

    await handler.execute(
      new GetChallengerLeagueQuery(region, queue, 5),
    );

    expect(getChallenger).toHaveBeenCalledWith(
      region,
      queue,
      5,
    );
  });
});
