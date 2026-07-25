import type {
  AccountProfile,
  AccountRank,
  ChallengerEntry,
  ChampionMastery,
  MostPlayedChampion,
} from "../model/AccountReadModels.js";
import type { QueueType } from "../value-object/QueueType.js";
import type { Region } from "../value-object/Region.js";

export interface AccountRepository {
  getProfile(
    gameName: string,
    tagLine: string,
    region: Region,
  ): Promise<AccountProfile>;
  getRanks(puuid: string, region: Region): Promise<AccountRank[]>;
  getMastery(
    puuid: string,
    region: Region,
    top: number,
  ): Promise<ChampionMastery[]>;
  getMostPlayed(
    puuid: string,
    region: Region,
    matchCount: number,
    top: number,
  ): Promise<MostPlayedChampion[]>;
  getChallenger(
    region: Region,
    queue: QueueType,
    count: number,
  ): Promise<ChallengerEntry[]>;
}
