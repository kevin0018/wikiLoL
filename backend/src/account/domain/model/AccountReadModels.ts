import type { RegionCode } from "../value-object/Region.js";

export interface AccountProfile {
  gameName: string;
  tagLine: string;
  puuid: string;
  summonerId: string;
  summonerLevel: number;
  region: RegionCode;
  iconUrl: string;
}

export interface AccountRank {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  rankIconUrl: string;
}

export interface ChampionMastery {
  championId: number;
  championName: string;
  championImageUrl: string;
  masteryPoints: number;
}

export interface MostPlayedChampion {
  championId: number;
  championName: string;
  championImageUrl: string;
  gamesPlayed: number;
}

export interface ChallengerEntry {
  puuid: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  gameName: string | null;
  tagLine: string | null;
  riotIdForDisplay: string;
}
