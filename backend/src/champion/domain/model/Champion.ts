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
  skins: ChampionSkin[];
}

export interface ChampionsResult {
  data: ChampionSummary[];
  patch: string;
}
