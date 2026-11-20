import { setTimeout as delay } from "node:timers/promises";
import type { MostPlayedChampion } from "../../domain/model/AccountReadModels.js";
import type { AccountRepository } from "../../domain/repository/AccountRepository.js";
import type { Region } from "../../domain/value-object/Region.js";

export const CHALLENGER_PICKS_TTL_SECONDS = 300;
const RECENT_MATCH_COUNT = 5;
const RECENT_CHAMPION_COUNT = 3;
const REQUEST_WINDOW_MS = 1_100;
const MAX_CACHE_ENTRIES = 256;

type PlayerPicks = MostPlayedChampion[] | null;

export class GetChallengerPicksHandler {
  private readonly cache = new Map<string, { picks: MostPlayedChampion[]; expiresAt: number }>();
  private readonly pending = new Map<string, Promise<PlayerPicks>>();
  private nextWindowAt = 0;

  constructor(private readonly repository: Pick<AccountRepository, "getMostPlayed">) {}

  async execute(
    puuids: string[],
    region: Region,
    locale: string,
  ): Promise<Record<string, PlayerPicks>> {
    const now = Date.now();
    const windowStart = Math.max(now, this.nextWindowAt);
    let misses = 0;
    const players = [...new Set(puuids)].map((puuid) => {
      const key = JSON.stringify([puuid, region.value, locale]);
      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > now) return [puuid, cached.picks] as const;

      let request = this.pending.get(key);
      if (!request) {
        // Leave room for the standings lookup, then fetch two match histories per window.
        const startsAt = windowStart + Math.ceil(misses / 2) * REQUEST_WINDOW_MS;
        misses += 1;
        request = this.fetchPicks(key, puuid, region, locale, startsAt - now);
        this.pending.set(key, request);
      }
      return [puuid, request] as const;
    });

    if (misses > 0) {
      this.nextWindowAt = windowStart + (Math.floor(misses / 2) + 1) * REQUEST_WINDOW_MS;
    }

    const entries = await Promise.all(
      players.map(async ([puuid, picks]) => [puuid, await picks] as const),
    );
    return Object.fromEntries(entries);
  }

  private async fetchPicks(
    key: string,
    puuid: string,
    region: Region,
    locale: string,
    waitMs: number,
  ): Promise<PlayerPicks> {
    try {
      await delay(waitMs);
      const picks = await this.repository.getMostPlayed(
        puuid, region, RECENT_MATCH_COUNT, RECENT_CHAMPION_COUNT, locale,
      );
      this.cache.delete(key);
      if (this.cache.size >= MAX_CACHE_ENTRIES) {
        const oldest = this.cache.keys().next();
        if (!oldest.done) this.cache.delete(oldest.value);
      }
      this.cache.set(key, {
        picks,
        expiresAt: Date.now() + CHALLENGER_PICKS_TTL_SECONDS * 1000,
      });
      return picks;
    } catch {
      return null;
    } finally {
      this.pending.delete(key);
    }
  }
}
