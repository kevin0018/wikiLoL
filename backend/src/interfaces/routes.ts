import {
  playerLookupSchema,
  queueTypeSchema,
  regionSchema,
} from "@wikilol/contracts";
import { Router } from "express";
import { z } from "zod";
import { GetAccountProfileHandler } from "../account/app/query/GetAccountProfileHandler.js";
import { GetAccountProfileQuery } from "../account/app/query/GetAccountProfileQuery.js";
import { GetAccountRankHandler } from "../account/app/query/GetAccountRankHandler.js";
import { GetAccountRankQuery } from "../account/app/query/GetAccountRankQuery.js";
import { GetChallengerLeagueHandler } from "../account/app/query/GetChallengerLeagueHandler.js";
import { GetChallengerLeagueQuery } from "../account/app/query/GetChallengerLeagueQuery.js";
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

apiRouter.get("/meta", async (_request, response) => {
  response.json({ patch: await dataDragonClient.getCurrentPatch() });
});

apiRouter.get("/champions", async (request, response) => {
  const query = localeQuerySchema.parse(request.query);
  response.json(
    await getChampionData.execute(new GetChampionDataQuery(query.locale)),
  );
});

apiRouter.get("/champions/:id", async (request, response) => {
  const query = localeQuerySchema.parse(request.query);
  response.json(
    await getChampionById.execute(
      new GetChampionByIdQuery(request.params.id, query.locale),
    ),
  );
});

apiRouter.get("/account/profile", async (request, response) => {
  const query = playerLookupSchema.parse(request.query);
  response.json(
    await getAccountProfile.execute(
      new GetAccountProfileQuery(
        query.gameName,
        query.tagLine,
        Region.from(query.region),
      ),
    ),
  );
});

apiRouter.get("/account/rank", async (request, response) => {
  const query = rankQuerySchema.parse(request.query);
  response.json(
    await getAccountRank.execute(
      new GetAccountRankQuery(
        query.puuid,
        Region.from(query.region),
      ),
    ),
  );
});

apiRouter.get("/account/mastery", async (request, response) => {
  const query = playerResourceSchema
    .extend({
      top: z.coerce.number().int().min(1).max(10).default(4),
      locale: localeSchema.default("es_ES"),
    })
    .parse(request.query);
  response.json(
    await getChampionMastery.execute(
      new GetChampionMasteryQuery(
        query.puuid,
        Region.from(query.region),
        query.top,
        query.locale,
      ),
    ),
  );
});

apiRouter.get("/account/most-played", async (request, response) => {
  const query = playerResourceSchema
    .extend({
      matchCount: z.coerce.number().int().min(1).max(50).default(20),
      top: z.coerce.number().int().min(1).max(10).default(4),
      locale: localeSchema.default("es_ES"),
    })
    .parse(request.query);
  response.json(
    await getMostPlayedChampion.execute(
      new GetMostPlayedChampionQuery(
        query.puuid,
        Region.from(query.region),
        query.matchCount,
        query.top,
        query.locale,
      ),
    ),
  );
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
