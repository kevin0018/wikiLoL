import {
  playerLookupSchema,
  queueTypeSchema,
  regionSchema,
} from "@wikilol/contracts";
import { Router } from "express";
import { z } from "zod";
import { GetAccountActivityHandler } from "../account/app/query/GetAccountActivityHandler.js";
import { GetAccountProfileHandler } from "../account/app/query/GetAccountProfileHandler.js";
import { GetAccountProfileQuery } from "../account/app/query/GetAccountProfileQuery.js";
import { GetAccountRankHandler } from "../account/app/query/GetAccountRankHandler.js";
import { GetAccountRankQuery } from "../account/app/query/GetAccountRankQuery.js";
import { GetChallengerLeagueHandler } from "../account/app/query/GetChallengerLeagueHandler.js";
import { GetChallengerLeagueQuery } from "../account/app/query/GetChallengerLeagueQuery.js";
import {
  CHALLENGER_PICKS_TTL_SECONDS,
  GetChallengerPicksHandler,
} from "../account/app/query/GetChallengerPicksHandler.js";
import { GetChampionMasteryHandler } from "../account/app/query/GetChampionMasteryHandler.js";
import { GetChampionMasteryQuery } from "../account/app/query/GetChampionMasteryQuery.js";
import { GetMostPlayedChampionHandler } from "../account/app/query/GetMostPlayedChampionHandler.js";
import { GetMostPlayedChampionQuery } from "../account/app/query/GetMostPlayedChampionQuery.js";
import { QueueType } from "../account/domain/value-object/QueueType.js";
import { Region } from "../account/domain/value-object/Region.js";
import { riotAccountRepository } from "../account/infra/RiotAccountRepository.js";
import { GetChampionByIdHandler } from "../champion/app/query/GetChampionByIdHandler.js";
import { GetChampionByIdQuery } from "../champion/app/query/GetChampionByIdQuery.js";
import { GetChampionDataHandler } from "../champion/app/query/GetChampionDataHandler.js";
import { GetChampionDataQuery } from "../champion/app/query/GetChampionDataQuery.js";
import { dataDragonClient } from "../champion/infra/DataDragonClient.js";

export const apiRouter = Router();

// Composition root: infrastructure is wired to application handlers only here.
const getAccountActivity = new GetAccountActivityHandler(riotAccountRepository);
const getAccountProfile = new GetAccountProfileHandler(
  riotAccountRepository,
);
const getAccountRank = new GetAccountRankHandler(riotAccountRepository);
const getChampionMastery = new GetChampionMasteryHandler(
  riotAccountRepository,
);
const getMostPlayedChampion = new GetMostPlayedChampionHandler(
  riotAccountRepository,
);
const getChallengerLeague = new GetChallengerLeagueHandler(
  riotAccountRepository,
);
const getChallengerPicks = new GetChallengerPicksHandler(riotAccountRepository);
const getChampionData = new GetChampionDataHandler(dataDragonClient);
const getChampionById = new GetChampionByIdHandler(dataDragonClient);

const rankQuerySchema = z.object({
  puuid: z.string().min(1),
  region: regionSchema,
});

const playerResourceSchema = z.object({
  puuid: z.string().min(1),
  region: regionSchema,
});

const localeSchema = z.enum(["en_US", "es_ES"]);
const localeQuerySchema = z.object({
  locale: localeSchema.default("es_ES"),
});
const playerCacheControl = "public, s-maxage=60";
const championCacheControl = "public, s-maxage=3600, stale-while-revalidate=300";

apiRouter.get("/meta", async (_request, response) => {
  response.json({ patch: await dataDragonClient.getCurrentPatch() });
});

apiRouter.get("/champions", async (request, response) => {
  const query = localeQuerySchema.parse(request.query);
  const champions = await getChampionData.execute(
    new GetChampionDataQuery(query.locale),
  );
  response.set("Vercel-CDN-Cache-Control", championCacheControl).json(champions);
});

apiRouter.get("/champions/:id", async (request, response) => {
  const query = localeQuerySchema.parse(request.query);
  const champion = await getChampionById.execute(
    new GetChampionByIdQuery(request.params.id, query.locale),
  );
  response.set("Vercel-CDN-Cache-Control", championCacheControl).json(champion);
});

apiRouter.get("/account/profile", async (request, response) => {
  const query = playerLookupSchema.parse(request.query);
  const profile = await getAccountProfile.execute(
    new GetAccountProfileQuery(
      query.gameName,
      query.tagLine,
      Region.from(query.region),
    ),
  );
  response.set("Vercel-CDN-Cache-Control", playerCacheControl).json(profile);
});

apiRouter.get("/account/rank", async (request, response) => {
  const query = rankQuerySchema.parse(request.query);
  const ranks = await getAccountRank.execute(
    new GetAccountRankQuery(
      query.puuid,
      Region.from(query.region),
    ),
  );
  response.set("Vercel-CDN-Cache-Control", playerCacheControl).json(ranks);
});

apiRouter.get("/account/mastery", async (request, response) => {
  const query = playerResourceSchema
    .extend({
      top: z.coerce.number().int().min(1).max(10).default(4),
      locale: localeSchema.default("es_ES"),
    })
    .parse(request.query);
  const mastery = await getChampionMastery.execute(
    new GetChampionMasteryQuery(
      query.puuid,
      Region.from(query.region),
      query.top,
      query.locale,
    ),
  );
  response.set("Vercel-CDN-Cache-Control", playerCacheControl).json(mastery);
});

apiRouter.get("/account/activity", async (request, response) => {
  const query = playerResourceSchema.merge(localeQuerySchema).parse(request.query);
  const activity = await getAccountActivity.execute(
    query.puuid, Region.from(query.region), query.locale,
  );
  response.set("Vercel-CDN-Cache-Control", playerCacheControl).json(activity);
});

apiRouter.get("/account/most-played", async (request, response) => {
  const query = playerResourceSchema
    .extend({
      matchCount: z.coerce.number().int().min(1).max(50).default(20),
      top: z.coerce.number().int().min(1).max(10).default(4),
      locale: localeSchema.default("es_ES"),
    })
    .parse(request.query);
  const mostPlayed = await getMostPlayedChampion.execute(
    new GetMostPlayedChampionQuery(
      query.puuid,
      Region.from(query.region),
      query.matchCount,
      query.top,
      query.locale,
    ),
  );
  response.set("Vercel-CDN-Cache-Control", playerCacheControl).json(mostPlayed);
});

apiRouter.get("/league/challenger", async (request, response) => {
  const query = z
    .object({
      region: regionSchema.default("EUW"),
      queue: queueTypeSchema.default("RANKED_SOLO_5x5"),
      count: z.coerce.number().int().min(1).max(10).default(5),
    })
    .parse(request.query);
  response.json(
    await getChallengerLeague.execute(
      new GetChallengerLeagueQuery(
        Region.from(query.region),
        QueueType.from(query.queue),
        query.count,
      ),
    ),
  );
});

apiRouter.get("/league/challenger/picks", async (request, response) => {
  const playerId = z.string().min(1).max(128);
  const query = z.object({
    puuid: z.union([playerId, z.array(playerId).min(1).max(5)]),
    region: regionSchema.default("EUW"),
    locale: localeSchema.default("es_ES"),
  }).parse(request.query);
  const puuids = Array.isArray(query.puuid) ? query.puuid : [query.puuid];
  const picks = await getChallengerPicks.execute(puuids, Region.from(query.region), query.locale);

  if (Object.values(picks).every((player) => player !== null)) {
    response.set("Cache-Control", "public, max-age=60");
    response.set("Vercel-CDN-Cache-Control", `public, s-maxage=${CHALLENGER_PICKS_TTL_SECONDS}`);
  }
  response.json(picks);
});
