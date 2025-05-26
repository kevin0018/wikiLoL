import {GetMostPlayedChampionQuery} from '../app/query/GetMostPlayedChampionQuery.js';

export function buildMostPlayedChampionController(getMostPlayedChampionHandler) {
	return async (req, res) => {
		const {puuid, region, matchCount, top} = req.query;
		try {
			const query = new GetMostPlayedChampionQuery({
				puuid,
				region,
				matchCount: matchCount ? parseInt(matchCount, 10) : undefined,
				top: top ? parseInt(top, 10) : undefined
			});
			const result = await getMostPlayedChampionHandler.execute(query);
			res.json(result);
		} catch (e) {
			res.status(500).json({error: e.message});
		}
	};
}