import { Router } from 'express';

// Account controllers
import { buildAccountProfileController } from '../account/presentation/AccountProfileController.js';
import { buildAccountRankController } from '../account/presentation/AccountRankController.js';
import { buildChampionMasteryController } from '../account/presentation/ChampionMasteryController.js';
import { buildMostPlayedChampionController } from '../account/presentation/MostPlayedChampionController.js';

// Account handlers
import { GetAccountRankHandler } from '../account/app/query/GetAccountRankHandler.js';
import { GetAccountProfileHandler } from '../account/app/query/GetAccountProfileHandler.js';
import { GetChampionMasteryHandler } from '../account/app/query/getChampionMasteryHandler.js';
import { GetMostPlayedChampionHandler } from '../account/app/query/getMostPlayedChampionHandler.js';

// Account services
import { AccountProfileService } from '../account/app/service/AccountProfileService.js';

// Account repositories
import { RiotAccountRepositoryImpl } from '../account/infra/RiotAccountRepositoryImpl.js';
import { RiotChampionRepositoryImpl } from '../account/infra/RiotChampionRepositoryImpl.js';

// Champion handlers
import { GetChampionByIdQuery } from '../champion/app/query/GetChampionByIdQuery.js';
import { GetChampionByIdHandler } from '../champion/app/query/GetChampionByIdHandler.js';
import { GetChampionDataHandler } from '../champion/app/query/GetChampionDataHandler.js';
import { GetChampionDataQuery } from '../champion/app/query/GetChampionDataQuery.js';

// Champion repositories
import { RiotChampionRepositoryImpl as ChampionRepo } from '../champion/infra/RiotChampionRepositoryImpl.js';
import { ChampionDataRepositoryImpl } from '../champion/infra/ChampionDataRepositoryImpl.js';

const router = Router();

// ---- DEPENDENCY INJECTION ----

// Account
const accountRepository = new RiotAccountRepositoryImpl();
const championRepository = new RiotChampionRepositoryImpl();

const accountProfileService = new AccountProfileService(accountRepository);
const getAccountProfileHandler = new GetAccountProfileHandler(accountProfileService);
const getAccountRankHandler = new GetAccountRankHandler(accountRepository);
const getChampionMasteryHandler = new GetChampionMasteryHandler(accountRepository, championRepository);
const getMostPlayedChampionHandler = new GetMostPlayedChampionHandler(accountRepository, championRepository);

// Champion
const championRepo = new ChampionRepo();
const getChampionByIdHandler = new GetChampionByIdHandler(championRepo);
const championDataRepository = new ChampionDataRepositoryImpl();
const getChampionDataHandler = new GetChampionDataHandler(championDataRepository);

// ---- ROUTES ----

// Route to get account rank
router.get('/account/profile', buildAccountProfileController(getAccountProfileHandler));
// Route to get account rank
router.get('/account/rank', buildAccountRankController(getAccountRankHandler));
// Route to get champion mastery
router.get('/account/mastery', buildChampionMasteryController(getChampionMasteryHandler));
// Route to get most played champion
router.get('/account/most-played', buildMostPlayedChampionController(getMostPlayedChampionHandler));


// Route to get champion data
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

export default router;