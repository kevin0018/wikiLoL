import type { MostPlayedChampion, Region } from "@wikilol/contracts";
import type { GetMostPlayedChampionQuery } from "./GetMostPlayedChampionQuery.js";

export interface MostPlayedChampionReader {
  getMostPlayed(
    puuid: string,
    region: Region,
    matchCount: number,
    top: number,
  ): Promise<MostPlayedChampion[]>;
}

export class GetMostPlayedChampionHandler {
  constructor(private readonly accounts: MostPlayedChampionReader) {}

  execute(
    query: GetMostPlayedChampionQuery,
  ): Promise<MostPlayedChampion[]> {
    return this.accounts.getMostPlayed(
      query.puuid,
      query.region,
      query.matchCount,
      query.top,
    );
  }
}
