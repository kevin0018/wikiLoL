import { jest } from '@jest/globals';
import { GetChampionByIdHandler } from '../../../../src/app/query/champion/GetChampionByIdHandler.js';
import { GetChampionByIdQuery } from '../../../../src/app/query/champion/GetChampionByIdQuery.js';

describe('GetChampionByIdHandler', () => {
    it('should return champion data when repository returns a champion', async () => {
        const mockChampion = {
            championId: "Aatrox",
            name: "Aatrox",
            title: "la Espada de los Oscuros",
            role: "Fighter",
            lore: "Aatrox y sus hermanos...",
            image: "Aatrox.png"
        };
        const mockRepo = { findByName: jest.fn().mockResolvedValue(mockChampion) };
        const handler = new GetChampionByIdHandler(mockRepo);
        const query = new GetChampionByIdQuery("Aatrox");
        const result = await handler.execute(query);
        expect(result).toEqual(mockChampion);
        expect(mockRepo.findByName).toHaveBeenCalledWith("Aatrox", "es_ES", "15.10.1");
    });

    it('should throw error if repository throws', async () => {
        const mockRepo = { findByName: jest.fn().mockRejectedValue(new Error("Not found")) };
        const handler = new GetChampionByIdHandler(mockRepo);
        const query = new GetChampionByIdQuery("NonExistent");
        await expect(handler.execute(query)).rejects.toThrow("Not found");
    });
});