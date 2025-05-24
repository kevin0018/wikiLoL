import { Router } from 'express';
import { GetChampionByIdQuery } from '../app/query/champion/GetChampionByIdQuery.js';
import { GetChampionByIdHandler } from '../app/query/champion/GetChampionByIdHandler.js';
import { RiotChampionRepositoryImpl } from '../infra/RiotChampionRepositoryImpl.js';
import { GetChampionDataHandler } from '../app/query/champion/GetChampionDataHandler.js';
import { GetChampionDataQuery } from '../app/query/champion/GetChampionDataQuery.js';
import { ChampionDataRepositoryImpl } from '../infra/ChampionDataRepositoryImpl.js';
import { GetAccountByRiotIdHandler } from '../app/query/account/GetAccountByRiotIdHandler.js';
import { GetAccountByRiotIdQuery } from '../app/query/account/GetAccountByRiotIdQuery.js';
import { RiotAccountRepositoryImpl } from '../infra/RiotAccountRepositoryImpl.js';

const router = Router();
const championRepository = new RiotChampionRepositoryImpl();
const getChampionByNameHandler = new GetChampionByIdHandler(championRepository);
const championDataRepository = new ChampionDataRepositoryImpl();
const getChampionDataHandler = new GetChampionDataHandler(championDataRepository);
const accountRepository = new RiotAccountRepositoryImpl();
const getAccountByRiotIdHandler = new GetAccountByRiotIdHandler(accountRepository);

router.get('/accounts/:gameName/:tagLine', async (req, res) => {
    const { gameName, tagLine } = req.params;
    try {
        const query = new GetAccountByRiotIdQuery(gameName, tagLine);
        const account = await getAccountByRiotIdHandler.execute(query);
        res.json(account);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

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

router.get('/champions/:name', async (req, res) => {
    const { name } = req.params;
    const { lang = "es_ES", version = "15.10.1" } = req.query;
    try {
        const query = new GetChampionByIdQuery(name, lang, version);
        const champion = await getChampionByNameHandler.execute(query);
        res.json(champion);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;