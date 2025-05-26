import {GetAccountProfileHandler} from '../../../application/query/GetAccountProfileHandler.js';
import {test, expect, jest} from '@jest/globals';
test('should return account profile from service', async () => {
	const fakeService = {
		getFullProfile: jest.fn().mockResolvedValue({
			gameName: 'Faker',
			tagLine: 'KR1',
			puuid: 'PUUID123',
			summonerId: 'ID123',
			profileIconId: 1234,
			summonerLevel: 999,
			region: 'EUW'
		})
	};
	const handler = new GetAccountProfileHandler(fakeService);
	const result = await handler.execute({gameName: 'Faker', tagLine: 'KR1', region: 'EUW'});
	expect(fakeService.getFullProfile).toHaveBeenCalledWith({gameName: 'Faker', tagLine: 'KR1', region: 'EUW'});
	expect(result.gameName).toBe('Faker');
	expect(result.region).toBe('EUW');
});