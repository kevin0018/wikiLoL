import { AccountRepository } from '../domain/AccountRepository.js';
import { Account } from '../domain/Account.js';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export class RiotAccountRepositoryImpl extends AccountRepository {
    async findByRiotId(gameName, tagLine) {
        const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        const response = await fetch(url, {
            headers: {
                "X-Riot-Token": RIOT_API_KEY
            }
        });
        if (!response.ok) {
            throw new Error(`Riot API error: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();
        return new Account({
            puuid: data.puuid,
            gameName: data.gameName,
            tagLine: data.tagLine
        });
    }
}