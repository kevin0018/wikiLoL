import type {
  ChampionDetail,
  ChampionsResult,
} from "../model/Champion.js";

export interface ChampionRepository {
  getCurrentPatch(): Promise<string>;
  getChampions(locale: string): Promise<ChampionsResult>;
  getChampion(id: string, locale: string): Promise<ChampionDetail>;
}
