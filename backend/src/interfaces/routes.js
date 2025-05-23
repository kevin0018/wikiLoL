const express = require('express');
const { getAccountByRiotId } = require('../app/getAccountByRiotIdService');
const { getChampionData } = require('../app/getChampionDataService');

const router = express.Router();

router.get('/account', async (req, res) => {
    const { gameName, tagLine } = req.query;
    if (!gameName || !tagLine) {
        return res.status(400).json({ error: 'Faltan parámetros gameName o tagLine.' });
    }
    try {
        const account = await getAccountByRiotId(gameName, tagLine);
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/champion', async (req, res) => {
    const { locale = 'es_ES', version = '15.10.1' } = req.query;
    try {
        const data = await getChampionData(locale, version);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;