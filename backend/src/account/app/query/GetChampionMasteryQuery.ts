import type { Region } from "../../domain/value-object/Region.js";

export class GetChampionMasteryQuery {
  constructor(
    public readonly puuid: string,
    public readonly region: Region,
    public readonly top = 4,
    public readonly locale = "es_ES",
  ) {}
}
