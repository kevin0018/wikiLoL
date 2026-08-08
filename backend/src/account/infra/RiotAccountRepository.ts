import type {
  AccountProfile,
  AccountRank,
  ChallengerEntry,
  ChampionMastery,
  MostPlayedChampion,
} from "../domain/model/AccountReadModels.js";
import type { AccountRepository } from "../domain/repository/AccountRepository.js";
import type { QueueType } from "../domain/value-object/QueueType.js";
import type {
  Region,
  RegionCode,
} from "../domain/value-object/Region.js";
import { z } from "zod";
import { dataDragonClient, type DataDragonClient } from "../../champion/infra/DataDragonClient.js";
import { fetchJson } from "../../shared/http.js";

const platformHosts: Record<RegionCode, string> = {
  EUW: "euw1.api.riotgames.com",
  EUNE: "eun1.api.riotgames.com",
  NA: "na1.api.riotgames.com",
  LAN: "la1.api.riotgames.com",
  LAS: "la2.api.riotgames.com",
  KR: "kr.api.riotgames.com",
  JP: "jp1.api.riotgames.com",
  BR: "br1.api.riotgames.com",
  OCE: "oc1.api.riotgames.com",
  TR: "tr1.api.riotgames.com",
  RU: "ru.api.riotgames.com",
};

const regionalHosts: Record<RegionCode, string> = {
  EUW: "europe.api.riotgames.com",
  EUNE: "europe.api.riotgames.com",
  NA: "americas.api.riotgames.com",
  LAN: "americas.api.riotgames.com",
  LAS: "americas.api.riotgames.com",
  KR: "asia.api.riotgames.com",
  JP: "asia.api.riotgames.com",
  BR: "americas.api.riotgames.com",
  OCE: "sea.api.riotgames.com",
  TR: "europe.api.riotgames.com",
  RU: "europe.api.riotgames.com",
};

const riotAccountSchema = z.object({
  puuid: z.string(),
  gameName: z.string(),
  tagLine: z.string(),
});

const summonerSchema = z.object({
  puuid: z.string(),
  profileIconId: z.number(),
  summonerLevel: z.number(),
});

const rankSchema = z.object({
  queueType: z.string(),
  tier: z.string(),
  rank: z.string(),
  leaguePoints: z.number(),
  wins: z.number(),
  losses: z.number(),
});

const masterySchema = z.object({
  championId: z.number(),
  championPoints: z.number(),
});

const matchSchema = z.object({
  info: z.object({
    participants: z.array(
      z.object({
        puuid: z.string(),
        championId: z.number(),
      }),
    ),
  }),
});

const challengerSchema = z.object({
  entries: z.array(
    z
      .object({
        puuid: z.string(),
        leaguePoints: z.number().default(0),
        wins: z.number().default(0),
        losses: z.number().default(0),
      })
      .passthrough(),
  ),
});

type RiotAccount = z.infer<typeof riotAccountSchema>;

const ACCOUNT_CACHE_TTL_MS = 15 * 60 * 1000;
const MATCH_BATCH_SIZE = 8;
const MATCH_BATCH_PAUSE_MS = 1000;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class RiotAccountRepository implements AccountRepository {
  private readonly accountCache = new Map<
    string,
    { value: RiotAccount; expiresAt: number }
  >();
  private readonly accountRequests = new Map<string, Promise<RiotAccount>>();

  constructor(private readonly dataDragon: DataDragonClient = dataDragonClient) {}

  async getProfile(
    gameName: string,
    tagLine: string,
    region: Region,
  ): Promise<AccountProfile> {
    const account = await this.riotFetch(
      regionalHosts[region.value],
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      riotAccountSchema,
    );
    const summoner = await this.riotFetch(
      platformHosts[region.value],
      `/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
      summonerSchema,
    );

    return {
      gameName: account.gameName,
      tagLine: account.tagLine,
      puuid: account.puuid,
      summonerLevel: summoner.summonerLevel,
      region: region.value,
      iconUrl: `/api/assets/profile-icon/${summoner.profileIconId}.png`,
    };
  }

  async getRanks(puuid: string, region: Region): Promise<AccountRank[]> {
    const ranks = await this.riotFetch(
      platformHosts[region.value],
      `/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`,
      z.array(rankSchema),
    );

    return ranks.map((rank) => ({
      ...rank,
      rankIconUrl: `/api/assets/ranked/${rank.tier.toLowerCase()}.png`,
    }));
  }

  async getMastery(
    puuid: string,
    region: Region,
    top: number,
    locale: string,
  ): Promise<ChampionMastery[]> {
    const masteries = await this.riotFetch(
      platformHosts[region.value],
      `/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}`,
      z.array(masterySchema),
    );

    return Promise.all(
      masteries.slice(0, top).map(async (mastery) => {
        const champion = await this.dataDragon.getChampionByNumericId(
          mastery.championId,
          locale,
        );
        return {
          championId: mastery.championId,
          championName: champion.name,
          championImageUrl: `/api/assets/champion/${champion.image.full}`,
          masteryPoints: mastery.championPoints,
        };
      }),
    );
  }

  async getMostPlayed(
    puuid: string,
    region: Region,
    matchCount: number,
    top: number,
    locale: string,
  ): Promise<MostPlayedChampion[]> {
    const matchIds = await this.riotFetch(
      regionalHosts[region.value],
      `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=${matchCount}`,
      z.array(z.string()),
    );
    const matches: z.infer<typeof matchSchema>[] = [];
    for (let index = 0; index < matchIds.length; index += MATCH_BATCH_SIZE) {
      if (index > 0) {
        await wait(MATCH_BATCH_PAUSE_MS);
      }

      const batch = await Promise.all(
        matchIds.slice(index, index + MATCH_BATCH_SIZE).map((matchId) =>
          this.riotFetch(
            regionalHosts[region.value],
            `/lol/match/v5/matches/${encodeURIComponent(matchId)}`,
            matchSchema,
          ),
        ),
      );
      matches.push(...batch);
    }
    const championCounts = new Map<number, number>();

    for (const match of matches) {
      const participant = match.info.participants.find(
        (candidate) => candidate.puuid === puuid,
      );
      if (participant) {
        championCounts.set(
          participant.championId,
          (championCounts.get(participant.championId) ?? 0) + 1,
        );
      }
    }

    const topChampions = [...championCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, top);

    return Promise.all(
      topChampions.map(async ([championId, gamesPlayed]) => {
        const champion =
          await this.dataDragon.getChampionByNumericId(championId, locale);
        return {
          championId,
          championName: champion.name,
          championImageUrl: `/api/assets/champion/${champion.image.full}`,
          gamesPlayed,
        };
      }),
    );
  }

  async getChallenger(
    region: Region,
    queue: QueueType,
    count = 5,
  ): Promise<ChallengerEntry[]> {
    const league = await this.riotFetch(
      platformHosts[region.value],
      `/lol/league/v4/challengerleagues/by-queue/${encodeURIComponent(queue.value)}`,
      challengerSchema,
    );

    return Promise.all(
      league.entries.slice(0, count).map(async (entry) => {
        try {
          const account = await this.getAccountByPuuid(entry.puuid, region);
          return {
            puuid: entry.puuid,
            leaguePoints: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            gameName: account.gameName,
            tagLine: account.tagLine,
            riotIdForDisplay: `${account.gameName}#${account.tagLine}`,
          };
        } catch {
          return {
            puuid: entry.puuid,
            leaguePoints: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            gameName: null,
            tagLine: null,
            riotIdForDisplay: "Riot ID no disponible",
          };
        }
      }),
    );
  }

  private getAccountByPuuid(
    puuid: string,
    region: Region,
  ): Promise<RiotAccount> {
    const cacheKey = `${region.value}:${puuid}`;
    const cached = this.accountCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return Promise.resolve(cached.value);
    }

    const pending = this.accountRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    const request = this.riotFetch(
      regionalHosts[region.value],
      `/riot/account/v1/accounts/by-puuid/${encodeURIComponent(puuid)}`,
      riotAccountSchema,
    )
      .then((account) => {
        this.accountCache.set(cacheKey, {
          value: account,
          expiresAt: Date.now() + ACCOUNT_CACHE_TTL_MS,
        });
        return account;
      })
      .finally(() => {
        this.accountRequests.delete(cacheKey);
      });

    this.accountRequests.set(cacheKey, request);
    return request;
  }

  private riotFetch<T>(
    host: string,
    path: string,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) {
      throw new Error("RIOT_API_KEY no está configurada.");
    }
    return fetchJson(
      `https://${host}${path}`,
      { headers: { "X-Riot-Token": apiKey } },
      schema,
    );
  }
}

export const riotAccountRepository = new RiotAccountRepository();
