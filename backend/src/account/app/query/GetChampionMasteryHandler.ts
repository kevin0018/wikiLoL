import type { ChampionMastery, Region } from "@wikilol/contracts";
import type { GetChampionMasteryQuery } from "./GetChampionMasteryQuery.js";

export interface ChampionMasteryReader {
  getMastery(
    puuid: string,
    region: Region,
    top: number,
  ): Promise<ChampionMastery[]>;
}

export class GetChampionMasteryHandler {
  constructor(private readonly accounts: ChampionMasteryReader) {}

  execute(query: GetChampionMasteryQuery): Promise<ChampionMastery[]> {
    return this.accounts.getMastery(query.puuid, query.region, query.top);
  }
}
