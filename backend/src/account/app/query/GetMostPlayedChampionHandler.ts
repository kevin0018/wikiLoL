import type { MostPlayedChampion } from "../../domain/model/AccountReadModels.js";
import type { AccountRepository } from "../../domain/repository/AccountRepository.js";
import type { GetMostPlayedChampionQuery } from "./GetMostPlayedChampionQuery.js";

export class GetMostPlayedChampionHandler {
  constructor(
    private readonly repository: Pick<AccountRepository, "getMostPlayed">,
  ) {}

  execute(
    query: GetMostPlayedChampionQuery,
  ): Promise<MostPlayedChampion[]> {
    return this.repository.getMostPlayed(
      query.puuid,
      query.region,
      query.matchCount,
      query.top,
    );
  }
}
