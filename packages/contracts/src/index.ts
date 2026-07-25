import { z } from "zod";

export const regionSchema = z.enum([
  "EUW",
  "EUNE",
  "NA",
  "LAN",
  "LAS",
  "KR",
  "JP",
  "BR",
  "OCE",
  "TR",
  "RU",
]);

export type Region = z.infer<typeof regionSchema>;

export const queueTypeSchema = z.enum([
  "RANKED_SOLO_5x5",
  "RANKED_FLEX_SR",
]);

export type QueueType = z.infer<typeof queueTypeSchema>;

export const championRoleSchema = z.enum([
  "Fighter",
  "Tank",
  "Mage",
  "Assassin",
  "Support",
  "Marksman",
]);

export type ChampionRole = z.infer<typeof championRoleSchema>;

export const championSkinSchema = z.object({
  num: z.number().int().nonnegative(),
  name: z.string(),
  imageUrl: z.string(),
});

export const championSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  roles: z.array(championRoleSchema),
  lore: z.string(),
  imageUrl: z.string(),
});

export const championDetailSchema = championSummarySchema.extend({
  skins: z.array(championSkinSchema),
});

export type ChampionSkin = z.infer<typeof championSkinSchema>;
export type ChampionSummary = z.infer<typeof championSummarySchema>;
export type ChampionDetail = z.infer<typeof championDetailSchema>;

export const championsResponseSchema = z.object({
  data: z.array(championSummarySchema),
  patch: z.string(),
});

export type ChampionsResponse = z.infer<typeof championsResponseSchema>;

export const accountProfileSchema = z.object({
  gameName: z.string(),
  tagLine: z.string(),
  puuid: z.string(),
  summonerLevel: z.number().int().nonnegative(),
  region: regionSchema,
  iconUrl: z.string(),
});

export const accountRankSchema = z.object({
  queueType: z.string(),
  tier: z.string(),
  rank: z.string(),
  leaguePoints: z.number(),
  wins: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  rankIconUrl: z.string(),
});

export const championMasterySchema = z.object({
  championId: z.number().int(),
  championName: z.string(),
  championImageUrl: z.string(),
  masteryPoints: z.number().int().nonnegative(),
});

export const mostPlayedChampionSchema = z.object({
  championId: z.number().int(),
  championName: z.string(),
  championImageUrl: z.string(),
  gamesPlayed: z.number().int().nonnegative(),
});

export const challengerEntrySchema = z.object({
  puuid: z.string(),
  leaguePoints: z.number().default(0),
  wins: z.number().default(0),
  losses: z.number().default(0),
  gameName: z.string().nullable(),
  tagLine: z.string().nullable(),
  riotIdForDisplay: z.string(),
});

export type AccountProfile = z.infer<typeof accountProfileSchema>;
export type AccountRank = z.infer<typeof accountRankSchema>;
export type ChampionMastery = z.infer<typeof championMasterySchema>;
export type MostPlayedChampion = z.infer<typeof mostPlayedChampionSchema>;
export type ChallengerEntry = z.infer<typeof challengerEntrySchema>;

export const playerLookupSchema = z.object({
  gameName: z.string().trim().min(1),
  tagLine: z.string().trim().min(1),
  region: regionSchema,
});

export type PlayerLookup = z.infer<typeof playerLookupSchema>;

export const apiErrorSchema = z.object({
  error: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
