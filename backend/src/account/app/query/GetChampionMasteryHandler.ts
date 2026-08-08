import type { ChampionMastery } from "../../domain/model/AccountReadModels.js";
import type { AccountRepository } from "../../domain/repository/AccountRepository.js";
import type { GetChampionMasteryQuery } from "./GetChampionMasteryQuery.js";

export class GetChampionMasteryHandler {
  constructor(
    private readonly repository: Pick<AccountRepository, "getMastery">,
  ) {}

  execute(query: GetChampionMasteryQuery): Promise<ChampionMastery[]> {
    return this.repository.getMastery(
      query.puuid,
      query.region,
      query.top,
      query.locale,
    );
  }
}
