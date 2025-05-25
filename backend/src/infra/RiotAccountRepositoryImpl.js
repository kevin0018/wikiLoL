import { AccountRepository } from '../domain/AccountRepository.js';
import { Account } from '../domain/Account.js';
import { AccountRank } from '../domain/AccountRank.js';
import process from "node:process";

await process.loadEnvFile();

const riotRegionMap = {
  EUW: "euw1.api.riotgames.com",
  NA: "na1.api.riotgames.com",
  EUNE: "eun1.api.riotgames.com",
  LAN: "la1.api.riotgames.com",
  LAS: "la2.api.riotgames.com",
};

export class RiotAccountRepositoryImpl extends AccountRepository {
    /**
     * Get account by Riot ID
     * @param {string} gameName
     * @param {string} tagLine
     * @returns {Promise<Account>}
     */
    async getByRiotId(gameName, tagLine) {
        const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        const response = await fetch(url, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
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

    /**
     * Get summoner details by puuid
     * @param {string} puuid
     * @param {string} [region]
     * @returns {Promise<Account>}
     */
    async getDetailsByPUUID(puuid, region) {
        // Get summoner details by puuid
        const url = `https://${riotRegionMap[region.toUpperCase()]}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        const response = await fetch(url, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        });
        if (!response.ok) {
            throw new Error(`Riot API error: ${response.status} - ${await response.text()}`);
        }
        return await response.json();
    }

    /**
     * Get ranked information by accountId (summonerId)
     * @param puuid
     * @param {string} region
     * @returns {Promise<*>}
     */
    async getRankByAccountId(puuid, region) {
        //Get summoner details
        const details = await this.getDetailsByPUUID(puuid, region);

        // Use summonerId to get ranked info
        const url = `https://${riotRegionMap[region.toUpperCase()]}/lol/league/v4/entries/by-summoner/${details.id}`;
        const response = await fetch(url, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        });
        if (!response.ok) {
            throw new Error(`Riot API error: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();

        // Map results to AccountRank entity
        return data.map(e =>
            new AccountRank({
                queueType: e.queueType,
                tier: e.tier,
                rank: e.rank,
                leaguePoints: e.leaguePoints,
                wins: e.wins,
                losses: e.losses
            })
        );
    }
}