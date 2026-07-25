import type { Region } from "../../domain/value-object/Region.js";

export class GetMostPlayedChampionQuery {
  constructor(
    public readonly puuid: string,
    public readonly region: Region,
    public readonly matchCount = 20,
    public readonly top = 4,
  ) {}
}
