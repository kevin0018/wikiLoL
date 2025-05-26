import { GetChampionMasteryQuery } from '../app/query/GetChampionMasteryQuery.js';

export function buildChampionMasteryController(getChampionMasteryHandler) {
  return async (req, res) => {
    const { puuid, region, top } = req.query;
    try {
      const query = new GetChampionMasteryQuery({ puuid, region, top: top ? parseInt(top, 10) : undefined });
      const result = await getChampionMasteryHandler.execute(query);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };
}