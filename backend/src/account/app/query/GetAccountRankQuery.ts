import type { Region } from "@wikilol/contracts";

export class GetAccountRankQuery {
  constructor(
    public readonly summonerId: string,
    public readonly region: Region,
  ) {}
}
