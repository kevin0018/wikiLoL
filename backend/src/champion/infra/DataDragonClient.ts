import type {
  ChampionDetail,
  ChampionRole,
  ChampionSummary,
} from "../domain/model/Champion.js";
import type { ChampionRepository } from "../domain/repository/ChampionRepository.js";
import { fetchJson } from "../../shared/http.js";

interface DataDragonImage {
  full: string;
}

interface DataDragonSkin {
  num: number;
  name: string;
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

export class DataDragonClient implements ChampionRepository {
  private versionCache?: { value: string; expiresAt: number };
  private championMapCache?: {
    value: Map<number, DataDragonChampion>;
    expiresAt: number;
  };

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

  async getChampions(locale = "es_ES"): Promise<{
    data: ChampionSummary[];
    patch: string;
  }> {
    const patch = await this.getCurrentPatch();
    const payload = await this.getChampionList(locale, patch);

    return {
      patch,
      data: Object.values(payload.data)
        .map((champion) => this.toSummary(champion))
        .sort((left, right) =>
          left.name.localeCompare(right.name, locale.replace("_", "-")),
        ),
    };
  }

  async getChampion(id: string, locale = "es_ES"): Promise<ChampionDetail> {
    const patch = await this.getCurrentPatch();
    const payload = await fetchJson<DataDragonListResponse>(
      `${DATA_DRAGON_URL}/${patch}/data/${locale}/champion/${encodeURIComponent(id)}.json`,
    );
    const champion = payload.data[id];
    if (!champion) {
      throw new Error("Campeón no encontrado.");
    }

    return {
      ...this.toSummary(champion),
      lore: champion.lore ?? champion.blurb,
      skins: (champion.skins ?? [])
        .sort((left, right) => left.num - right.num)
        .map((skin) => ({
          num: skin.num,
          name:
            skin.name === "default" || skin.name === champion.name
              ? "Aspecto original"
              : skin.name,
          imageUrl: `/api/assets/skin/${champion.id}/${skin.num}.jpg`,
        })),
    };
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
    if (
      this.championMapCache &&
      this.championMapCache.expiresAt > Date.now()
    ) {
      return this.championMapCache.value;
    }

    const patch = await this.getCurrentPatch();
    const payload = await this.getChampionList(locale, patch);
    const value = new Map(
      Object.values(payload.data).map((champion) => [
        Number(champion.key),
        champion,
      ]),
    );

    this.championMapCache = {
      value,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
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

  private toSummary(champion: DataDragonChampion): ChampionSummary {
    return {
      id: champion.id,
      name: champion.name,
      title: champion.title,
      roles: champion.tags,
      lore: champion.blurb,
      imageUrl: `/api/assets/champion/${champion.image.full}`,
    };
  }
}

export const dataDragonClient = new DataDragonClient();
