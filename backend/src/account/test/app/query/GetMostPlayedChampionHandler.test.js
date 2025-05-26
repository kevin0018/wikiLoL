import { GetMostPlayedChampionHandler } from '../../../application/query/GetMostPlayedChampionHandler.js';
import {test, expect, jest} from '@jest/globals';

test('should return most played champions sorted', async () => {
  const fakeAccountRepo = {
    getRecentMatchIds: jest.fn().mockResolvedValue(['match1', 'match2', 'match3']),
    getMatchDetails: jest.fn()
      .mockResolvedValueOnce({
        info: {
          participants: [{ puuid: 'PUUID', championId: 10 }]
        }
      })
      .mockResolvedValueOnce({
        info: {
          participants: [{ puuid: 'PUUID', championId: 20 }]
        }
      })
      .mockResolvedValueOnce({
        info: {
          participants: [{ puuid: 'PUUID', championId: 10 }]
        }
      })
  };
  const fakeChampionRepo = {
    getChampionInfo: jest.fn(id => Promise.resolve({ name: `Champ${id}`, imageUrl: `/img/${id}.png` }))
  };
  const handler = new GetMostPlayedChampionHandler(fakeAccountRepo, fakeChampionRepo);
  const result = await handler.execute({ puuid: 'PUUID', region: 'EUW', matchCount: 3, top: 2 });
  expect(result).toHaveLength(2);
  expect(result[0].championId).toBe(10);
  expect(result[0].gamesPlayed).toBe(2);
  expect(result[1].championId).toBe(20);
  expect(result[1].gamesPlayed).toBe(1);
});