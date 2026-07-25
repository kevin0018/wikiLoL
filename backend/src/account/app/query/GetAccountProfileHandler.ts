import type { AccountProfile, Region } from "@wikilol/contracts";
import type { GetAccountProfileQuery } from "./GetAccountProfileQuery.js";

export interface AccountProfileReader {
  getProfile(
    gameName: string,
    tagLine: string,
    region: Region,
  ): Promise<AccountProfile>;
}

export class GetAccountProfileHandler {
  constructor(private readonly accounts: AccountProfileReader) {}

  execute(query: GetAccountProfileQuery): Promise<AccountProfile> {
    return this.accounts.getProfile(
      query.gameName,
      query.tagLine,
      query.region,
    );
  }
}
