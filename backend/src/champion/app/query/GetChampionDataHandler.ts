import type { ChampionsResponse } from "@wikilol/contracts";
import type { GetChampionDataQuery } from "./GetChampionDataQuery.js";

export interface ChampionArchiveReader {
  getChampions(locale: string): Promise<ChampionsResponse>;
}

export class GetChampionDataHandler {
  constructor(private readonly champions: ChampionArchiveReader) {}

  execute(query: GetChampionDataQuery): Promise<ChampionsResponse> {
    return this.champions.getChampions(query.locale);
  }
}
