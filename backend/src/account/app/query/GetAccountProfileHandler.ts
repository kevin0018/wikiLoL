import type { AccountProfile } from "../../domain/model/AccountReadModels.js";
import type { AccountRepository } from "../../domain/repository/AccountRepository.js";
import type { GetAccountProfileQuery } from "./GetAccountProfileQuery.js";

export class GetAccountProfileHandler {
  constructor(
    private readonly repository: Pick<AccountRepository, "getProfile">,
  ) {}

  execute(query: GetAccountProfileQuery): Promise<AccountProfile> {
    return this.repository.getProfile(
      query.gameName,
      query.tagLine,
      query.region,
    );
  }
}
