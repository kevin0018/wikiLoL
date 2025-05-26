import {describe, expect, it, jest} from '@jest/globals';
import { GetChampionByIdHandler } from '../../../app/query/GetChampionByIdHandler.js';
import { GetChampionByIdQuery } from '../../../app/query/GetChampionByIdQuery.js';

describe('GetChampionByIdHandler', () => {
    it('should return champion data when repository returns a champion', async () => {
        const mockChampion = {
            Id: "Aatrox",
            name: "Aatrox",
            title: "la Espada de los Oscuros",
            role: "Fighter",
            lore: "Aatrox y sus hermanos...",
            image: "Aatrox.png",
            version: "15.10.1",
            imageUrl: "https://ddragon.leagueoflegends.com/cdn/15.10.1/img/champion/Aatrox.png"
        };
        const mockRepo = { findById: jest.fn().mockResolvedValue(mockChampion) };
        const handler = new GetChampionByIdHandler(mockRepo);
        const query = new GetChampionByIdQuery("Aatrox");
        const result = await handler.execute(query);
        expect(result).toEqual(mockChampion);
        expect(mockRepo.findById).toHaveBeenCalledWith("Aatrox", "es_ES", "15.10.1");
    });

    it('should throw error if repository throws', async () => {
        const mockRepo = { findById: jest.fn().mockRejectedValue(new Error("Not found")) };
        const handler = new GetChampionByIdHandler(mockRepo);
        const query = new GetChampionByIdQuery("NonExistent");
        await expect(handler.execute(query)).rejects.toThrow("Not found");
    });
});