import type { Region } from "@wikilol/contracts";

export class GetChampionMasteryQuery {
  constructor(
    public readonly puuid: string,
    public readonly region: Region,
    public readonly top = 4,
  ) {}
}
