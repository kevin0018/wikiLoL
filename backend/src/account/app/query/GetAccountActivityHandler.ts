import type { AccountRepository } from "../../domain/repository/AccountRepository.js";
import type { Region } from "../../domain/value-object/Region.js";

export class GetAccountActivityHandler {
  constructor(private readonly repository: Pick<AccountRepository, "getActivity" | "getActivityPage">) {}

  execute(puuid: string, region: Region, locale: string) {
    return this.repository.getActivity(puuid, region, locale);
  }

  executePage(puuid: string, region: Region, locale: string, start: number) {
    return this.repository.getActivityPage(puuid, region, locale, start);
  }
}
