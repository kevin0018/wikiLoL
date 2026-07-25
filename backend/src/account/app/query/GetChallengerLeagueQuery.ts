import type { QueueType } from "../../domain/value-object/QueueType.js";
import type { Region } from "../../domain/value-object/Region.js";

export class GetChallengerLeagueQuery {
  constructor(
    public readonly region: Region,
    public readonly queue: QueueType,
    public readonly count = 5,
  ) {}
}
