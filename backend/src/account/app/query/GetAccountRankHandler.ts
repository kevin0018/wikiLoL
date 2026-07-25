import type { AccountRank, Region } from "@wikilol/contracts";
import type { GetAccountRankQuery } from "./GetAccountRankQuery.js";

export interface AccountRankReader {
  getRanks(summonerId: string, region: Region): Promise<AccountRank[]>;
}

export class GetAccountRankHandler {
  constructor(private readonly accounts: AccountRankReader) {}

  execute(query: GetAccountRankQuery): Promise<AccountRank[]> {
    return this.accounts.getRanks(query.summonerId, query.region);
  }
}
