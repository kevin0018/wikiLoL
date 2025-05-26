import { GetAccountRankQuery } from '../app/query/GetAccountRankQuery.js';

export function buildAccountRankController(getAccountRankHandler) {
  return async (req, res) => {
    const { summonerId, region } = req.query;
    try {
      const query = new GetAccountRankQuery({ summonerId, region });
      const result = await getAccountRankHandler.execute(query);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };
}