import {describe, expect, it, jest} from '@jest/globals';
import { GetChampionDataHandler } from '../../../../src/champion/app/query/GetChampionDataHandler.js';
import { GetChampionDataQuery } from '../../../../src/champion/app/query/GetChampionDataQuery.js';

describe('GetChampionDataHandler', () => {
    it('should return champion data from repository', async () => {
        const mockData = [{ name: "Aatrox" }];
        const mockRepo = { fetchAll: jest.fn().mockResolvedValue(mockData) };
        const handler = new GetChampionDataHandler(mockRepo);
        const query = new GetChampionDataQuery("es_ES", "15.10.1");
        const result = await handler.execute(query);
        expect(result).toEqual({ data: mockData });
        expect(mockRepo.fetchAll).toHaveBeenCalledWith("es_ES", "15.10.1");
    });

    it('should throw error if repository throws', async () => {
        const mockRepo = { fetchAll: jest.fn().mockRejectedValue(new Error("DataDragon API error: 404")) };
        const handler = new GetChampionDataHandler(mockRepo);
        const query = new GetChampionDataQuery("es_ES", "bad_version");
        await expect(handler.execute(query)).rejects.toThrow("DataDragon API error: 404");
    });
});