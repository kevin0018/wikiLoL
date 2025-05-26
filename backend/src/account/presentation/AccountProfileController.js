import {GetAccountProfileQuery} from '../app/query/GetAccountProfileQuery.js';

export function buildAccountProfileController(getAccountProfileHandler) {
	return async (req, res) => {
		const {gameName, tagLine, region} = req.query;
		try {
			const query = new GetAccountProfileQuery({gameName, tagLine, region});
			const result = await getAccountProfileHandler.execute(query);
			res.json(result);
		} catch (e) {
			res.status(500).json({error: e.message});
		}
	};
}