import type { Region } from "../../domain/value-object/Region.js";

export class GetAccountProfileQuery {
  constructor(
    public readonly gameName: string,
    public readonly tagLine: string,
    public readonly region: Region,
  ) {}
}
