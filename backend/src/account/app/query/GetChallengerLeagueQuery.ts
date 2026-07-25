import type { QueueType, Region } from "@wikilol/contracts";

export class GetChallengerLeagueQuery {
  constructor(
    public readonly region: Region,
    public readonly queue: QueueType,
    public readonly count = 5,
  ) {}
}
