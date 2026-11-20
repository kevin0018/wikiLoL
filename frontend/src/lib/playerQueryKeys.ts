import type { PlayerLookup, Region } from "@wikilol/contracts";
import type { DataDragonLocale } from "../i18n/I18nProvider";

export const playerQueryKeys = {
  profile: (lookup: PlayerLookup | null) => [
    "player-profile",
    lookup?.region,
    lookup?.gameName.toLowerCase(),
    lookup?.tagLine.toLowerCase(),
  ],
  ranks: (puuid: string | undefined, region: Region | undefined) => [
    "player-ranks",
    puuid,
    region,
  ],
  mastery: (
    puuid: string | undefined,
    region: Region | undefined,
    locale: DataDragonLocale,
  ) => ["player-mastery", puuid, region, locale],
};
