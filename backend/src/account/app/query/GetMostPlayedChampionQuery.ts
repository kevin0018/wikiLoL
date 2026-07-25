import type { Region } from "@wikilol/contracts";

export class GetMostPlayedChampionQuery {
  constructor(
    public readonly puuid: string,
    public readonly region: Region,
    public readonly matchCount = 20,
    public readonly top = 4,
  ) {}
}
