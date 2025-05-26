import {GetAccountRankHandler} from '../../../app/query/GetAccountRankHandler.js';
import {test, expect, jest} from '@jest/globals';

test('should return ranks from repository', async () => {
	const fakeRepo = {
		getRankBySummonerId: jest.fn().mockResolvedValue([{
			queueType: 'RANKED_SOLO_5x5',
			tier: 'GOLD',
			rank: 'IV',
			leaguePoints: 50
		}])
	};
	const handler = new GetAccountRankHandler(fakeRepo);
	const result = await handler.execute({summonerId: '123', region: 'EUW'});
	expect(fakeRepo.getRankBySummonerId).toHaveBeenCalledWith('123', 'EUW');
	expect(result).toHaveLength(1);
	expect(result[0].tier).toBe('GOLD');
});