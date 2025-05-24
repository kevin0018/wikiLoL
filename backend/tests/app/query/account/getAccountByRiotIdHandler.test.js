import { jest } from '@jest/globals';
import { GetAccountByRiotIdHandler } from '../../../../src/app/query/account/GetAccountByRiotIdHandler.js';
import { GetAccountByRiotIdQuery } from '../../../../src/app/query/account/GetAccountByRiotIdQuery.js';

describe('GetAccountByRiotIdHandler', () => {
    it('should return account data when repository returns an account', async () => {
        const mockAccount = {
            puuid: "1234",
            gameName: "Summoner",
            tagLine: "EUW"
        };
        const mockRepo = { findByRiotId: jest.fn().mockResolvedValue(mockAccount) };
        const handler = new GetAccountByRiotIdHandler(mockRepo);
        const query = new GetAccountByRiotIdQuery("Summoner", "EUW");
        const result = await handler.execute(query);
        expect(result).toEqual(mockAccount);
        expect(mockRepo.findByRiotId).toHaveBeenCalledWith("Summoner", "EUW");
    });

    it('should throw error if repository throws', async () => {
        const mockRepo = { findByRiotId: jest.fn().mockRejectedValue(new Error("Not found")) };
        const handler = new GetAccountByRiotIdHandler(mockRepo);
        const query = new GetAccountByRiotIdQuery("Fake", "NA");
        await expect(handler.execute(query)).rejects.toThrow("Not found");
    });
});