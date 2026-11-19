import type { AccountRepository } from "../../domain/repository/AccountRepository.js";
import type { Region } from "../../domain/value-object/Region.js";

export class GetAccountActivityHandler {
  constructor(private readonly repository: Pick<AccountRepository, "getActivity">) {}

  execute(puuid: string, region: Region, locale: string) {
    return this.repository.getActivity(puuid, region, locale);
  }
}
