import {GetChampionMasteryHandler} from '../../../application/query/GetChampionMasteryHandler.js';
import {test, expect, jest} from '@jest/globals';

test('should return enriched champion mastery list', async () => {
	const fakeAccountRepo = {
		getChampionMasteryTop: jest.fn().mockResolvedValue([
			{championId: 1, masteryPoints: 1000},
			{championId: 2, masteryPoints: 900}
		])
	};
	const fakeChampionRepo = {
		getChampionInfo: jest.fn(id => Promise.resolve({name: `Champ${id}`, imageUrl: `/img/${id}.png`}))
	};
	const handler = new GetChampionMasteryHandler(fakeAccountRepo, fakeChampionRepo);
	const result = await handler.execute({puuid: 'PUUID', region: 'EUW', top: 2});
	expect(result).toHaveLength(2);
	expect(result[0].championName).toBe('Champ1');
	expect(result[1].championImageUrl).toBe('/img/2.png');
});