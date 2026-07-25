import type { ChampionDetail } from "@wikilol/contracts";
import type { GetChampionByIdQuery } from "./GetChampionByIdQuery.js";

export interface ChampionDetailReader {
  getChampion(id: string, locale: string): Promise<ChampionDetail>;
}

export class GetChampionByIdHandler {
  constructor(private readonly champions: ChampionDetailReader) {}

  execute(query: GetChampionByIdQuery): Promise<ChampionDetail> {
    return this.champions.getChampion(query.id, query.locale);
  }
}
