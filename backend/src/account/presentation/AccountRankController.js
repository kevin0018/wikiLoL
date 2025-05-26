import { GetAccountRankQuery } from '../app/query/GetAccountRankQuery.js';

export function buildAccountRankController(getAccountRankHandler) {
  return async (req, res) => {
    const { summonerId, region } = req.query;
    // Check for missing params (early return)
    if (!summonerId || !region) {
      console.error("Missing required query parameters:", { summonerId, region });
      return res.status(400).json({ error: "Faltan parámetros requeridos: summonerId y region." });
    }

    try {
      const query = new GetAccountRankQuery({summonerId, region});
      const result = await getAccountRankHandler.execute(query);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };
}