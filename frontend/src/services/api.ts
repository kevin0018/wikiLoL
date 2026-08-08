import {
  accountProfileSchema,
  accountRankSchema,
  challengerEntrySchema,
  championDetailSchema,
  championMasterySchema,
  championsResponseSchema,
  mostPlayedChampionSchema,
  type PlayerLookup,
} from "@wikilol/contracts";
import { z } from "zod";
import type { DataDragonLocale } from "../i18n/I18nProvider";

const apiBaseUrl = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "The request could not be completed.";
    throw new Error(message);
  }

  return schema.parse(await response.json());
}

function params(values: Record<string, string | number>): string {
  return new URLSearchParams(
    Object.entries(values).map(([key, value]) => [key, String(value)]),
  ).toString();
}

export const api = {
  champions: (locale: DataDragonLocale) =>
    request(
      `/api/champions?${params({ locale })}`,
      championsResponseSchema,
    ),
  champion: (id: string, locale: DataDragonLocale) =>
    request(
      `/api/champions/${encodeURIComponent(id)}?${params({ locale })}`,
      championDetailSchema,
    ),
  profile: (lookup: PlayerLookup) =>
    request(
      `/api/account/profile?${params(lookup)}`,
      accountProfileSchema,
    ),
  ranks: (puuid: string, region: string) =>
    request(
      `/api/account/rank?${params({ puuid, region })}`,
      z.array(accountRankSchema),
    ),
  mastery: (puuid: string, region: string, locale: DataDragonLocale) =>
    request(
      `/api/account/mastery?${params({ puuid, region, locale })}`,
      z.array(championMasterySchema),
    ),
  mostPlayed: (puuid: string, region: string, locale: DataDragonLocale) =>
    request(
      `/api/account/most-played?${params({ puuid, region, locale })}`,
      z.array(mostPlayedChampionSchema),
    ),
  challenger: (region = "EUW") =>
    request(
      `/api/league/challenger?${params({ region, count: 5 })}`,
      z.array(challengerEntrySchema),
    ),
};
