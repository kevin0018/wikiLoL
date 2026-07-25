import type {
  ChallengerEntry,
  QueueType,
  Region,
} from "@wikilol/contracts";
import type { GetChallengerLeagueQuery } from "./GetChallengerLeagueQuery.js";

export interface ChallengerLeagueReader {
  getChallenger(
    region: Region,
    queue: QueueType,
    count: number,
  ): Promise<ChallengerEntry[]>;
}

export class GetChallengerLeagueHandler {
  constructor(private readonly accounts: ChallengerLeagueReader) {}

  execute(query: GetChallengerLeagueQuery): Promise<ChallengerEntry[]> {
    return this.accounts.getChallenger(
      query.region,
      query.queue,
      query.count,
    );
  }
}
