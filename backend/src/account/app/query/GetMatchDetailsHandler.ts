import type { AccountRepository } from "../../domain/repository/AccountRepository.js";
import type { Region } from "../../domain/value-object/Region.js";

export class GetMatchDetailsHandler {
  constructor(private readonly repository: Pick<AccountRepository, "getMatchDetails">) {}

  execute(matchId: string, region: Region, locale: string) {
    return this.repository.getMatchDetails(matchId, region, locale);
  }
}
