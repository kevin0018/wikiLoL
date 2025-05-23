const express = require('express');
const { getAccountByRiotId } = require('../app/getAccountByRiotIdService');

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

module.exports = router;