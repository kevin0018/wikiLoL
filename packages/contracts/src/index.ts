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
  classic: z.array(championSummarySchema),
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

const recentMatchSchema = z.object({
  matchId: z.string(),
  championName: z.string(),
  championImageUrl: z.string().nullable(),
  win: z.boolean(),
  kills: z.number().int().nonnegative(),
  deaths: z.number().int().nonnegative(),
  assists: z.number().int().nonnegative(),
  queueId: z.number().int().nonnegative(),
  durationSeconds: z.number().int().nonnegative(),
  startedAt: z.number().int().nonnegative(),
});

export const accountActivitySchema = z.object({
  matches: z.array(recentMatchSchema),
  mostPlayed: z.array(mostPlayedChampionSchema),
});
export type RecentMatch = z.infer<typeof recentMatchSchema>;

export const matchDetailsSchema = z.object({
  teams: z.array(z.object({
    teamId: z.number(),
    win: z.boolean(),
    kills: z.number(),
    players: z.array(z.object({
      championName: z.string(),
      championImageUrl: z.string().nullable(),
      playerName: z.string(),
      tagLine: z.string(),
      kills: z.number(),
      deaths: z.number(),
      assists: z.number(),
      damage: z.number().int().nonnegative().nullable().default(null),
      gold: z.number().int().nonnegative().nullable().default(null),
      farm: z.number().int().nonnegative().nullable().default(null),
      items: z.array(z.object({ name: z.string(), imageUrl: z.string() }).nullable()),
    })),
  })),
});
export type MatchDetails = z.infer<typeof matchDetailsSchema>;

export const challengerPicksSchema = z.record(
  z.string(),
  z.array(mostPlayedChampionSchema).nullable(),
);

export const challengerEntrySchema = z.object({
  puuid: z.string(),
  leaguePoints: z.number().default(0),
  wins: z.number().default(0),
  losses: z.number().default(0),
  gameName: z.string().nullable(),
  tagLine: z.string().nullable(),
  riotIdForDisplay: z.string(),
  iconUrl: z.string().optional(),
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
