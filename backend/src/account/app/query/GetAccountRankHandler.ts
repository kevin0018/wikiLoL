import type { AccountRank } from "../../domain/model/AccountReadModels.js";
import type { AccountRepository } from "../../domain/repository/AccountRepository.js";
import type { GetAccountRankQuery } from "./GetAccountRankQuery.js";

export class GetAccountRankHandler {
  constructor(
    private readonly repository: Pick<AccountRepository, "getRanks">,
  ) {}

  execute(query: GetAccountRankQuery): Promise<AccountRank[]> {
    return this.repository.getRanks(query.puuid, query.region);
  }
}
