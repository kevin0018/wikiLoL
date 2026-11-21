import type {
  ChampionDetail,
  ChampionRole,
  ChampionSummary,
  ChampionsResult,
} from "../domain/model/Champion.js";
import type { ChampionRepository } from "../domain/repository/ChampionRepository.js";
import { fetchJson, UpstreamError } from "../../shared/http.js";
import classicSplashArchive from "./classicSplashArchive.json" with { type: "json" };
import classicSplashSources from "./classicSplashSources.json" with { type: "json" };

interface DataDragonImage {
  full: string;
}

interface DataDragonSkin {
  num: number;
  name: string;
  parentSkin?: number | string;
}

interface DataDragonChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: ChampionRole[];
  blurb: string;
  lore?: string;
  image: DataDragonImage;
  skins?: DataDragonSkin[];
}

interface DataDragonListResponse {
  data: Record<string, DataDragonChampion>;
}

const VERSIONS_URL =
  "https://ddragon.leagueoflegends.com/api/versions.json";
const DATA_DRAGON_URL = "https://ddragon.leagueoflegends.com/cdn";
const CACHE_TTL_MS = 60 * 60 * 1000;
const CLASSIC_CHAMPION_PREFIX = "Jade_";
// The last 2015 patch provides the historical catalog before modern skins.
const CLASSIC_BASE_SKIN_NUMBERS = new Set([301, 302]);
// These regular skin IDs have distinct historical art in Riot's Classic namespace.
const OFFICIAL_CLASSIC_SPLASHES = new Map(Object.entries(classicSplashSources.native));
const ARCHIVED_CLASSIC_SPLASHES = new Map(Object.entries(classicSplashArchive.skins));
const ARCHIVED_CHAMPION_IDS: Record<string, string> = {
  Fiddlesticks: "FiddleSticks",
  Wukong: "MonkeyKing",
};

function dataDragonText(text: string): string {
  return text.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<[^>]*>/g, "").trim();
}

function isChroma(skin: DataDragonSkin): boolean {
  return skin.parentSkin !== undefined;
}

export function isClassicChampion(id: string): boolean {
  return id.startsWith(CLASSIC_CHAMPION_PREFIX);
}

function isStandardChampion(champion: DataDragonChampion): boolean {
  return !isClassicChampion(champion.id);
}

function sortChampions(
  champions: ChampionSummary[],
  locale: string,
): ChampionSummary[] {
  return champions.sort((left, right) =>
    left.name.localeCompare(right.name, locale.replace("_", "-")),
  );
}

export class DataDragonClient implements ChampionRepository {
  private readonly itemNameCache = new Map<string, Promise<ReadonlyMap<string, string>>>();
  private readonly classicArchiveCache = new Map<string, Promise<DataDragonChampion | undefined>>();
  private versionCache?: { value: string; expiresAt: number };
  private championMapCache = new Map<string, {
    value: Map<number, DataDragonChampion>;
    expiresAt: number;
  }>();

  async getCurrentPatch(): Promise<string> {
    if (this.versionCache && this.versionCache.expiresAt > Date.now()) {
      return this.versionCache.value;
    }

    const versions = await fetchJson<string[]>(VERSIONS_URL);
    const version = versions[0];
    if (!version) {
      throw new Error("Data Dragon no devolvió una versión válida.");
    }

    this.versionCache = {
      value: version,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    return version;
  }

  getItemNames(locale: string, patch: string): Promise<ReadonlyMap<string, string>> {
    const key = `${patch}:${locale}`;
    const cached = this.itemNameCache.get(key);
    if (cached) return cached;

    if (this.itemNameCache.size >= 16) {
      const oldest = this.itemNameCache.keys().next();
      if (!oldest.done) this.itemNameCache.delete(oldest.value);
    }

    const request = fetchJson<{ data: Record<string, { name: string }> }>(
      `${DATA_DRAGON_URL}/${patch}/data/${locale}/item.json`,
    ).then(({ data }) => new Map(Object.entries(data).map(([id, item]) => [id, item.name])))
      .catch((error: unknown) => {
        if (this.itemNameCache.get(key) === request) this.itemNameCache.delete(key);
        throw error;
      });
    this.itemNameCache.set(key, request);
    return request;
  }

  async getChampions(locale = "es_ES"): Promise<ChampionsResult> {
    const patch = await this.getCurrentPatch();
    const [current, classic] = await Promise.all([
      this.getChampionList(locale, patch),
      this.getClassicChampionList(locale, patch),
    ]);

    return {
      patch,
      data: sortChampions(
        Object.values(current.data)
          .filter(isStandardChampion)
          .map((champion) => this.toSummary(champion)),
        locale,
      ),
      classic: sortChampions(
        classic.map((champion) => this.toSummary(champion)),
        locale,
      ),
    };
  }

  async getChampion(id: string, locale = "es_ES"): Promise<ChampionDetail> {
    const patch = await this.getCurrentPatch();
    const classic = isClassicChampion(id);
    const mode = classic ? "/mode/classic" : "";
    const payload = await fetchJson<DataDragonListResponse>(
      `${DATA_DRAGON_URL}/${patch}/data/${locale}${mode}/champion/${encodeURIComponent(id)}.json`,
    );
    const champion = payload.data[id];
    if (!champion) {
      throw new Error(
        locale.startsWith("es") ? "Campeón no encontrado." : "Champion not found.",
      );
    }
    const currentId = id.slice(CLASSIC_CHAMPION_PREFIX.length);
    const archivedId = classic ? (ARCHIVED_CHAMPION_IDS[currentId] ?? currentId) : undefined;
    const archive = archivedId ? await this.getClassicArchive(archivedId, locale) : undefined;
    const archivedSplashes = archivedId ? ARCHIVED_CLASSIC_SPLASHES.get(archivedId) : undefined;
    const officialClassicSplashes = OFFICIAL_CLASSIC_SPLASHES.get(champion.id);
    let skins = (champion.skins ?? []).filter((skin) => !isChroma(skin));
    if (classic) {
      const historicalNumbers = new Set(archive?.skins?.map((skin) => skin.num));
      const hasClassicBase = skins.some((skin) => CLASSIC_BASE_SKIN_NUMBERS.has(skin.num));
      skins = skins.filter(({ num }) => {
        if (num === 0) return !hasClassicBase;
        return CLASSIC_BASE_SKIN_NUMBERS.has(num) || historicalNumbers.has(num);
      });
    }

    return {
      ...this.toSummary(champion),
      lore: classic ? dataDragonText(archive?.lore ?? archive?.blurb ?? "") : champion.lore ?? champion.blurb,
      ...(classic && {
        classicNotes: dataDragonText(champion.lore || champion.blurb)
          .split(/\n+/)
          .map((line) => line.replace(/^\s*-\s*/, "").trim())
          .filter(Boolean),
      }),
      skins: skins
        .sort((left, right) => {
          if (classic) {
            const leftBase = CLASSIC_BASE_SKIN_NUMBERS.has(left.num);
            const rightBase = CLASSIC_BASE_SKIN_NUMBERS.has(right.num);
            if (leftBase !== rightBase) return leftBase ? -1 : 1;
          }
          return left.num - right.num;
        })
        .map((skin) => ({
          num: skin.num,
          name:
            skin.name === "default" || skin.name === champion.name
              ? locale.startsWith("es")
                ? "Aspecto original"
                : "Original skin"
              : skin.name,
          imageUrl: archivedSplashes?.includes(skin.num) &&
            !CLASSIC_BASE_SKIN_NUMBERS.has(skin.num) &&
            !officialClassicSplashes?.includes(skin.num)
            ? `/images/classic/${classicSplashArchive.patch}/${archivedId}_${skin.num}.jpg`
            : `/api/assets/skin/${champion.id}/${skin.num}.jpg`,
        })),
    };
  }

  private getClassicArchive(archivedId: string, locale: string): Promise<DataDragonChampion | undefined> {
    const key = `${locale}:${archivedId}`;
    const cached = this.classicArchiveCache.get(key);
    if (cached) return cached;

    const request = fetchJson<DataDragonListResponse>(
      `${DATA_DRAGON_URL}/${classicSplashArchive.patch}/data/${locale}/champion/${encodeURIComponent(archivedId)}.json`,
    ).then(({ data }) => data[archivedId]).catch(() => {
      this.classicArchiveCache.delete(key);
      return undefined;
    });
    this.classicArchiveCache.set(key, request);
    return request;
  }

  async getChampionByNumericId(
    championId: number,
    locale = "es_ES",
  ): Promise<DataDragonChampion> {
    const championMap = await this.getChampionMap(locale);
    const champion = championMap.get(championId);
    if (!champion) {
      throw new Error(`Campeón ${championId} no encontrado.`);
    }
    return champion;
  }

  private async getChampionMap(
    locale: string,
  ): Promise<Map<number, DataDragonChampion>> {
    const cached = this.championMapCache.get(locale);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const patch = await this.getCurrentPatch();
    const payload = await this.getChampionList(locale, patch);
    const value = new Map(
      Object.values(payload.data)
        .filter(isStandardChampion)
        .map((champion) => [Number(champion.key), champion]),
    );

    this.championMapCache.set(locale, {
      value,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return value;
  }

  private getChampionList(
    locale: string,
    patch: string,
  ): Promise<DataDragonListResponse> {
    return fetchJson(
      `${DATA_DRAGON_URL}/${patch}/data/${locale}/champion.json`,
    );
  }

  private async getClassicChampionList(
    locale: string,
    patch: string,
  ): Promise<DataDragonChampion[]> {
    try {
      const payload = await fetchJson<DataDragonListResponse>(
        `${DATA_DRAGON_URL}/${patch}/data/${locale}/mode/classic/champion.json`,
      );
      return Object.values(payload.data);
    } catch (error) {
      // Data Dragon can return 403 for files absent from a patch.
      if (error instanceof UpstreamError && [403, 404].includes(error.status)) {
        return [];
      }
      throw error;
    }
  }

  private toSummary(champion: DataDragonChampion): ChampionSummary {
    return {
      id: champion.id,
      name: champion.name,
      title: champion.title,
      roles: champion.tags,
      lore: isClassicChampion(champion.id) ? "" : champion.blurb,
      imageUrl: `/api/assets/champion/${champion.image.full}`,
    };
  }
}

export const dataDragonClient = new DataDragonClient();
