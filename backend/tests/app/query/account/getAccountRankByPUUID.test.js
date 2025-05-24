import { RiotAccountRepositoryImpl } from '../../../../src/infra/RiotAccountRepositoryImpl.js';
import { AccountRank } from '../../../../src/domain/AccountRank.js';
import {describe, expect, it, jest} from "@jest/globals";

// Mock fetch globally
global.fetch = jest.fn();

const RIOT_API_KEY = 'FAKE_KEY';

describe('RiotAccountRepositoryImpl', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('debería devolver un array de AccountRank para un puuid válido', async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 'fake-summoner-id'
                }),
            })
            // Mock response for league entries
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ([
                    {
                        queueType: "RANKED_SOLO_5x5",
                        tier: "PLATINUM",
                        rank: "I",
                        leaguePoints: 99,
                        wins: 30,
                        losses: 15
                    },
                    {
                        queueType: "RANKED_FLEX_SR",
                        tier: "GOLD",
                        rank: "II",
                        leaguePoints: 60,
                        wins: 20,
                        losses: 18
                    }
                ]),
            });

        const repo = new RiotAccountRepositoryImpl(RIOT_API_KEY);

        const result = await repo.getRankByAccountId('fake-puuid');

        // Debe ser un array de AccountRank
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);

        expect(result[0]).toBeInstanceOf(AccountRank);
        expect(result[0].queueType).toBe("RANKED_SOLO_5x5");
        expect(result[0].tier).toBe("PLATINUM");
        expect(result[0].rank).toBe("I");
        expect(result[0].leaguePoints).toBe(99);
        expect(result[0].wins).toBe(30);
        expect(result[0].losses).toBe(15);

        expect(result[1]).toBeInstanceOf(AccountRank);
        expect(result[1].queueType).toBe("RANKED_FLEX_SR");
    });

    it('lanza un error si la petición getDetailsByPUUID falla', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            text: async () => 'Not found'
        });

        const repo = new RiotAccountRepositoryImpl(RIOT_API_KEY);

        await expect(repo.getRankByAccountId('fake-puuid')).rejects.toThrow('Riot API error: 404 - Not found');
    });

    it('lanza un error si la petición de rango falla', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'fake-summoner-id' }),
        });
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 403,
            text: async () => 'Forbidden'
        });

        const repo = new RiotAccountRepositoryImpl(RIOT_API_KEY);

        await expect(repo.getRankByAccountId('fake-puuid')).rejects.toThrow('Riot API error: 403 - Forbidden');
    });
});