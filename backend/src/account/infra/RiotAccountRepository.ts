import type { MatchDetails } from "@wikilol/contracts";
import type {
  AccountActivity,
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

const itemSlot = z.number().int().nonnegative().default(0);

const matchSchema = z.object({
  info: z.object({
    queueId: z.number().int().nonnegative().default(0),
    gameDuration: z.number().int().nonnegative().default(0),
    gameStartTimestamp: z.number().int().nonnegative().default(0),
    gameVersion: z.string().default(""),
    teams: z.array(z.object({ teamId: z.number(), win: z.boolean().default(false) })).default([]),
    participants: z.array(
      z.object({
        puuid: z.string(),
        championId: z.number(),
        championName: z.string().optional(),
        teamId: z.number().default(0),
        playerSubteamId: z.number().default(0),
        riotIdGameName: z.string().default(""),
        riotIdTagline: z.string().default(""),
        summonerName: z.string().default(""),
        totalDamageDealtToChampions: z.number().int().nonnegative().optional(),
        goldEarned: z.number().int().nonnegative().optional(),
        totalMinionsKilled: z.number().int().nonnegative().optional(),
        neutralMinionsKilled: z.number().int().nonnegative().optional(),
        item0: itemSlot,
        item1: itemSlot,
        item2: itemSlot,
        item3: itemSlot,
        item4: itemSlot,
        item5: itemSlot,
        item6: itemSlot,
        win: z.boolean().default(false),
        kills: z.number().int().nonnegative().default(0),
        deaths: z.number().int().nonnegative().default(0),
        assists: z.number().int().nonnegative().default(0),
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

type MatchInfo = z.infer<typeof matchSchema>["info"];

interface PlayerMatch {
  matchId: string;
  info: Omit<MatchInfo, "participants">;
  player: MatchInfo["participants"][number];
}

const MATCH_HISTORY_TTL_MS = 60_000;
const MATCH_HISTORY_CACHE_LIMIT = 256;
const MATCH_DETAILS_CACHE_LIMIT = 512;
const ACCOUNT_CACHE_TTL_MS = 15 * 60 * 1000;
const MATCH_BATCH_SIZE = 8;
const MATCH_BATCH_PAUSE_MS = 1000;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function profileIconUrl(iconId: number): string {
  return `/api/assets/profile-icon/${iconId}.png`;
}

export class RiotAccountRepository implements AccountRepository {
  private readonly accountCache = new Map<
    string,
    { value: RiotAccount; expiresAt: number }
  >();
  private readonly accountRequests = new Map<string, Promise<RiotAccount>>();

  private readonly matchHistoryCache = new Map<
    string,
    { matches: PlayerMatch[]; expiresAt: number }
  >();
  private readonly matchHistoryRequests = new Map<string, Promise<PlayerMatch[]>>();

  private readonly matchDetailsCache = new Map<string, Promise<MatchInfo>>();

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
    const summoner = await this.getSummoner(account.puuid, region);

    return {
      gameName: account.gameName,
      tagLine: account.tagLine,
      puuid: account.puuid,
      summonerLevel: summoner.summonerLevel,
      region: region.value,
      iconUrl: profileIconUrl(summoner.profileIconId),
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
    const matches = await this.getPlayerMatches(puuid, region, matchCount);
    return this.summarizeMostPlayed(matches, top, locale);
  }

  async getActivity(puuid: string, region: Region, locale: string): Promise<AccountActivity> {
    const history = await this.getPlayerMatches(puuid, region, 20);
    const mostPlayed = await this.summarizeMostPlayed(history, 4, locale);
    const knownChampions = new Map(mostPlayed.map((champion) => [champion.championId, champion]));
    const matches = await Promise.all(history.slice(0, 5).map(async ({ matchId, info, player }) => {
      const champion = knownChampions.get(player.championId)
        ?? await this.getChampionPortrait(player.championId, locale).catch(() => null);
      return {
        matchId,
        championName: champion?.championName ?? player.championName ?? String(player.championId),
        championImageUrl: champion?.championImageUrl ?? null,
        win: player.win,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        queueId: info.queueId,
        durationSeconds: info.gameDuration,
        startedAt: info.gameStartTimestamp,
      };
    }));
    return { matches, mostPlayed };
  }

  async getMatchDetails(matchId: string, region: Region, locale: string): Promise<MatchDetails> {
    const match = await this.getMatch(regionalHosts[region.value], matchId);
    const release = match.gameVersion.match(/^([0-9]+\.[0-9]+)\./)?.[1];
    const patch = release ? `${release}.1` : await this.dataDragon.getCurrentPatch();
    const itemNames = await this.dataDragon.getItemNames(locale, patch).catch(() => null);

    const teams = new Map<number, MatchDetails["teams"][number]>();
    const arena = match.participants.some((player) => player.playerSubteamId > 0);
    const players = await Promise.all(match.participants.map(async (player) => {
      const champion = await this.getChampionPortrait(player.championId, locale).catch(() => null);
      const championName = champion?.championName ?? player.championName ?? String(player.championId);
      const slots = [player.item0, player.item1, player.item2, player.item3, player.item4, player.item5, player.item6];
      const items = slots.map((id) => id > 0 ? {
        name: itemNames?.get(String(id)) ?? String(id),
        imageUrl: `/api/assets/item/${patch}/${id}.png`,
      } : null);
      return {
        teamId: arena ? player.playerSubteamId : player.teamId,
        win: player.win,
        entry: {
          championName,
          championImageUrl: champion?.championImageUrl ?? null,
          playerName: player.riotIdGameName || player.summonerName || championName,
          tagLine: player.riotIdTagline,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          damage: player.totalDamageDealtToChampions ?? null,
          gold: player.goldEarned ?? null,
          farm: player.totalMinionsKilled === undefined && player.neutralMinionsKilled === undefined
            ? null
            : (player.totalMinionsKilled ?? 0) + (player.neutralMinionsKilled ?? 0),
          items,
        },
      };
    }));

    for (const { teamId, win, entry } of players) {
      let team = teams.get(teamId);
      if (!team) {
        const result = arena ? undefined : match.teams.find((team) => team.teamId === teamId);
        team = { teamId, win: result?.win ?? win, kills: 0, players: [] };
        teams.set(teamId, team);
      }
      team.kills += entry.kills;
      team.players.push(entry);
    }
    return { teams: [...teams.values()].sort((left, right) => left.teamId - right.teamId) };
  }

  private getMatch(host: string, matchId: string): Promise<MatchInfo> {
    const key = JSON.stringify([host, matchId]);
    const existing = this.matchDetailsCache.get(key);
    if (existing) return existing;

    if (this.matchDetailsCache.size >= MATCH_DETAILS_CACHE_LIMIT) {
      const oldest = this.matchDetailsCache.keys().next();
      if (!oldest.done) this.matchDetailsCache.delete(oldest.value);
    }
    const request = Promise.resolve().then(() => this.riotFetch(
      host,
      `/lol/match/v5/matches/${encodeURIComponent(matchId)}`,
      matchSchema,
    )).then(({ info }) => info).catch((error: unknown) => {
      if (this.matchDetailsCache.get(key) === request) this.matchDetailsCache.delete(key);
      throw error;
    });
    this.matchDetailsCache.set(key, request);
    return request;
  }

  private getPlayerMatches(puuid: string, region: Region, matchCount: number): Promise<PlayerMatch[]> {
    const host = regionalHosts[region.value];
    const key = JSON.stringify([host, puuid, matchCount]);
    const cached = this.matchHistoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.matches);

    const pending = this.matchHistoryRequests.get(key);
    if (pending) return pending;

    const request = this.fetchPlayerMatches(puuid, host, matchCount)
      .then((matches) => {
        this.matchHistoryCache.delete(key);
        if (this.matchHistoryCache.size >= MATCH_HISTORY_CACHE_LIMIT) {
          const oldest = this.matchHistoryCache.keys().next();
          if (!oldest.done) this.matchHistoryCache.delete(oldest.value);
        }
        this.matchHistoryCache.set(key, { matches, expiresAt: Date.now() + MATCH_HISTORY_TTL_MS });
        return matches;
      })
      .finally(() => this.matchHistoryRequests.delete(key));
    this.matchHistoryRequests.set(key, request);
    return request;
  }

  private async fetchPlayerMatches(puuid: string, host: string, matchCount: number): Promise<PlayerMatch[]> {
    const matchIds = await this.riotFetch(
      host,
      `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=${matchCount}`,
      z.array(z.string()),
    );
    const matches: PlayerMatch[] = [];
    for (let index = 0; index < matchIds.length; index += MATCH_BATCH_SIZE) {
      if (index > 0) await wait(MATCH_BATCH_PAUSE_MS);

      const batch = await Promise.all(
        matchIds.slice(index, index + MATCH_BATCH_SIZE).map(async (matchId) => {
          const { participants, ...info } = await this.getMatch(host, matchId);
          const player = participants.find((candidate) => candidate.puuid === puuid);
          return player && { matchId, info, player };
        }),
      );
      for (const match of batch) {
        if (match) matches.push(match);
      }
    }
    return matches;
  }

  private summarizeMostPlayed(
    matches: PlayerMatch[],
    top: number,
    locale: string,
  ): Promise<MostPlayedChampion[]> {
    const championCounts = new Map<number, number>();

    for (const { player } of matches) {
      championCounts.set(player.championId, (championCounts.get(player.championId) ?? 0) + 1);
    }

    const topChampions = [...championCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, top);

    return Promise.all(
      topChampions.map(async ([championId, gamesPlayed]) => ({
        ...await this.getChampionPortrait(championId, locale),
        gamesPlayed,
      })),
    );
  }

  private async getChampionPortrait(championId: number, locale: string) {
    const champion = await this.dataDragon.getChampionByNumericId(championId, locale);
    return { championId, championName: champion.name, championImageUrl: `/api/assets/champion/${champion.image.full}` };
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
        const [account, summoner] = await Promise.allSettled([
          this.getAccountByPuuid(entry.puuid, region),
          this.getSummoner(entry.puuid, region),
        ]);
        const identity = account.status === "fulfilled" ? account.value : null;

        return {
          puuid: entry.puuid,
          leaguePoints: entry.leaguePoints,
          wins: entry.wins,
          losses: entry.losses,
          gameName: identity?.gameName ?? null,
          tagLine: identity?.tagLine ?? null,
          riotIdForDisplay: identity
            ? `${identity.gameName}#${identity.tagLine}`
            : "Riot ID no disponible",
          ...(summoner.status === "fulfilled" && {
            iconUrl: profileIconUrl(summoner.value.profileIconId),
          }),
        };
      }),
    );
  }

  private getSummoner(puuid: string, region: Region) {
    return this.riotFetch(
      platformHosts[region.value],
      `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`,
      summonerSchema,
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
