import { Router } from 'express';

// Account controllers
import { buildAccountProfileController } from '../account/presentation/AccountProfileController.js';
import { buildAccountRankController } from '../account/presentation/AccountRankController.js';
import { buildChampionMasteryController } from '../account/presentation/ChampionMasteryController.js';
import { buildMostPlayedChampionController } from '../account/presentation/MostPlayedChampionController.js';

// League controllers
import { buildChallengerLeagueController } from '../account/presentation/ChallengerLeagueController.js';

// Account handlers
import { GetAccountRankHandler } from '../account/app/query/GetAccountRankHandler.js';
import { GetAccountProfileHandler } from '../account/app/query/GetAccountProfileHandler.js';
import { GetChampionMasteryHandler } from '../account/app/query/GetChampionMasteryHandler.js';
import { GetMostPlayedChampionHandler } from '../account/app/query/GetMostPlayedChampionHandler.js';

// League handlers
import { GetChallengerLeagueHandler } from '../account/app/query/GetChallengerLeagueHandler.js';

// Account services
import { AccountProfileService } from '../account/app/service/AccountProfileService.js';

// Account repositories
import { RiotAccountRepositoryImpl } from '../account/infra/RiotAccountRepositoryImpl.js';
// This is the champion repository specifically for account-related champion data (e.g., mastery)
import { RiotChampionRepositoryImpl as AccountContextChampionRepository } from '../account/infra/RiotChampionRepositoryImpl.js';

// Champion handlers 
import { GetChampionByIdQuery } from '../champion/app/query/GetChampionByIdQuery.js';
import { GetChampionByIdHandler } from '../champion/app/query/GetChampionByIdHandler.js';
import { GetChampionDataHandler } from '../champion/app/query/GetChampionDataHandler.js';
import { GetChampionDataQuery } from '../champion/app/query/GetChampionDataQuery.js';

// Champion repositories
import { RiotChampionRepositoryImpl as GeneralChampionRepository } from '../champion/infra/RiotChampionRepositoryImpl.js';
import { ChampionDataRepositoryImpl } from '../champion/infra/ChampionDataRepositoryImpl.js';

// Utility for loading static data
import { loadChampionStaticData } from '../proxy/infra/championStaticDataLoader.js';


const router = Router();

// ---- DEPENDENCY INJECTION ----

// Load static champion data
const championMap = await loadChampionStaticData();

// Account Repositories
const accountRepository = new RiotAccountRepositoryImpl();
// Champion repository for the account context (e.g., needs championMap to resolve IDs from mastery)
const accountContextChampionRepository = new AccountContextChampionRepository(championMap);

// Account Services and Handlers
const accountProfileService = new AccountProfileService(accountRepository);
const getAccountProfileHandler = new GetAccountProfileHandler(accountProfileService);
const getAccountRankHandler = new GetAccountRankHandler(accountRepository);
const getChampionMasteryHandler = new GetChampionMasteryHandler(accountRepository, accountContextChampionRepository);
const getMostPlayedChampionHandler = new GetMostPlayedChampionHandler(accountRepository, accountContextChampionRepository);

// League Handlers
const getChallengerLeagueHandler = new GetChallengerLeagueHandler(accountRepository);

// Champion Repositories
const generalChampionRepoInstance = new GeneralChampionRepository();
const championDataRepository = new ChampionDataRepositoryImpl();

// Champion Handlers
const getChampionByIdHandler = new GetChampionByIdHandler(generalChampionRepoInstance);
const getChampionDataHandler = new GetChampionDataHandler(championDataRepository);


// ---- ROUTES ----

// Account Routes
router.get('/account/profile', buildAccountProfileController(getAccountProfileHandler));
router.get('/account/rank', buildAccountRankController(getAccountRankHandler));
router.get('/account/mastery', buildChampionMasteryController(getChampionMasteryHandler));
router.get('/account/most-played', buildMostPlayedChampionController(getMostPlayedChampionHandler));

// League Routes
router.get('/league/challenger', buildChallengerLeagueController(getChallengerLeagueHandler));

// Champion Routes (General champion data)
router.get('/champions', async (req, res) => {
    const { locale = "es_ES", version = "15.10.1" } = req.query;
    try {
        const query = new GetChampionDataQuery(locale, version);
        const data = await getChampionDataHandler.execute(query);
        res.json(data);
    } catch (error) {
        console.error(`Error in /champions route: ${error.message}`);
        res.status(500).json({ error: "Error interno del servidor al obtener datos de campeones." });
    }
});

router.get('/champions/:id', async (req, res) => {
    const { id } = req.params;
    const { lang = "es_ES", version = "15.10.1" } = req.query;
    try {
        const query = new GetChampionByIdQuery(id, lang, version);
        const champion = await getChampionByIdHandler.execute(query);
        res.json(champion);
    } catch (error) {
        console.error(`Error in /champions/:id route: ${error.message}`);
        if (error.message.toLowerCase().includes('not found')) {
            res.status(404).json({ error: "Campeón no encontrado." });
        } else {
            res.status(500).json({ error: "Error interno del servidor al obtener el campeón." });
        }
    }
});

export default router;