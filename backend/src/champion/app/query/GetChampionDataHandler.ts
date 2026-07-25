import type { ChampionsResult } from "../../domain/model/Champion.js";
import type { ChampionRepository } from "../../domain/repository/ChampionRepository.js";
import type { GetChampionDataQuery } from "./GetChampionDataQuery.js";

export class GetChampionDataHandler {
  constructor(
    private readonly repository: Pick<ChampionRepository, "getChampions">,
  ) {}

  execute(query: GetChampionDataQuery): Promise<ChampionsResult> {
    return this.repository.getChampions(query.locale);
  }
}
