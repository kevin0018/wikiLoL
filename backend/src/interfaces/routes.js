import { Router } from 'express';
import { GetChampionByIdQuery } from '../app/query/champion/GetChampionByIdQuery.js';
import { GetChampionByIdHandler } from '../app/query/champion/GetChampionByIdHandler.js';
import { RiotChampionRepositoryImpl } from '../infra/repositories/RiotChampionRepositoryImpl.js';
import { GetChampionDataHandler } from '../app/query/champion/GetChampionDataHandler.js';
import { GetChampionDataQuery } from '../app/query/champion/GetChampionDataQuery.js';
import { ChampionDataRepositoryImpl } from '../infra/repositories/ChampionDataRepositoryImpl.js';
import { GetAccountByRiotIdHandler } from '../app/query/account/GetAccountByRiotIdHandler.js';
import { GetAccountByRiotIdQuery } from '../app/query/account/GetAccountByRiotIdQuery.js';
import { RiotAccountRepositoryImpl } from '../infra/repositories/RiotAccountRepositoryImpl.js';
import { GetAccountRankHandler } from '../app/query/account/GetAccountRankHandler.js';
import { GetAccountRankQuery } from '../app/query/account/GetAccountRankQuery.js';

const router = Router();
const championRepository = new RiotChampionRepositoryImpl();
const getChampionByIdHandler = new GetChampionByIdHandler(championRepository);
const championDataRepository = new ChampionDataRepositoryImpl();
const getChampionDataHandler = new GetChampionDataHandler(championDataRepository);
const accountRepository = new RiotAccountRepositoryImpl();
const getAccountByRiotIdHandler = new GetAccountByRiotIdHandler(accountRepository);
const getAccountRankHandler = new GetAccountRankHandler(accountRepository);
const getAccountRankByIdHandler = new GetAccountRankHandler(accountRepository);


// Route to get account by Riot ID
router.get('/account/:gameName/:tagLine', async (req, res) => {
    const { gameName, tagLine } = req.params;
    try {
        const query = new GetAccountByRiotIdQuery(gameName, tagLine);
        const account = await getAccountByRiotIdHandler.execute(query);
        res.json(account);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Route to get account by PUUID
router.get('/champions', async (req, res) => {
    const { locale = "es_ES", version = "15.10.1" } = req.query;
    try {
        const query = new GetChampionDataQuery(locale, version);
        const data = await getChampionDataHandler.execute(query);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get champion by ID
router.get('/champions/:id', async (req, res) => {
    const { id } = req.params;
    const { lang = "es_ES", version = "15.10.1" } = req.query;
    try {
        const query = new GetChampionByIdQuery(id, lang, version);
        const champion = await getChampionByIdHandler.execute(query);
        res.json(champion);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Route to get account rank by PUUID
router.get('/account/rank/:region/:puuid', async (req, res) => {
    const { region, puuid } = req.params;
    try {
        const query = new GetAccountRankQuery(puuid, region);
        const rank = await getAccountRankHandler.execute(query);
        res.json(rank);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;