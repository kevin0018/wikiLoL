export type ChampionRole =
  | "Fighter"
  | "Tank"
  | "Mage"
  | "Assassin"
  | "Support"
  | "Marksman";

export interface ChampionSummary {
  id: string;
  name: string;
  title: string;
  roles: ChampionRole[];
  lore: string;
  imageUrl: string;
}

export interface ChampionSkin {
  num: number;
  name: string;
  imageUrl: string;
}

export interface ChampionDetail extends ChampionSummary {
  classicNotes?: string[];
  skins: ChampionSkin[];
}

export interface ChampionsResult {
  data: ChampionSummary[];
  classic: ChampionSummary[];
  patch: string;
}
