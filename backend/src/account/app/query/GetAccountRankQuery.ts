import type { Region } from "../../domain/value-object/Region.js";

export class GetAccountRankQuery {
  constructor(
    public readonly puuid: string,
    public readonly region: Region,
  ) {}
}
