import type { ChampionDetail } from "../../domain/model/Champion.js";
import type { ChampionRepository } from "../../domain/repository/ChampionRepository.js";
import type { GetChampionByIdQuery } from "./GetChampionByIdQuery.js";

export class GetChampionByIdHandler {
  constructor(
    private readonly repository: Pick<ChampionRepository, "getChampion">,
  ) {}

  execute(query: GetChampionByIdQuery): Promise<ChampionDetail> {
    return this.repository.getChampion(query.id, query.locale);
  }
}
