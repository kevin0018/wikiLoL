import type { ChallengerEntry } from "../../domain/model/AccountReadModels.js";
import type { AccountRepository } from "../../domain/repository/AccountRepository.js";
import type { GetChallengerLeagueQuery } from "./GetChallengerLeagueQuery.js";

export class GetChallengerLeagueHandler {
  constructor(
    private readonly repository: Pick<AccountRepository, "getChallenger">,
  ) {}

  execute(query: GetChallengerLeagueQuery): Promise<ChallengerEntry[]> {
    return this.repository.getChallenger(
      query.region,
      query.queue,
      query.count,
    );
  }
}
