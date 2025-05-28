import { AccountRank } from '../domain/model/AccountRank.js';
import { ChampionMastery } from '../domain/model/ChampionMastery.js';

// Riot API region mapping for platform-specific endpoints
const riotRegionMap = {
	EUW: "euw1.api.riotgames.com",
	NA: "na1.api.riotgames.com",
	EUNE: "eun1.api.riotgames.com",
	LAN: "la1.api.riotgames.com",
	LAS: "la2.api.riotgames.com",
	KR: "kr.api.riotgames.com",
	JP: "jp1.api.riotgames.com",
	BR: "br1.api.riotgames.com",
	OCE: "oc1.api.riotgames.com",
	TR: "tr1.api.riotgames.com",
	RU: "ru.api.riotgames.com",
};

// Riot API regional routing for broader endpoints
const regionalRouting = {
	EUW: "europe.api.riotgames.com",
	EUNE: "europe.api.riotgames.com",
	NA: "americas.api.riotgames.com",
	LAN: "americas.api.riotgames.com",
	LAS: "americas.api.riotgames.com",
	KR: "asia.api.riotgames.com",
	JP: "asia.api.riotgames.com",
	BR: "americas.api.riotgames.com",
	OCE: "sea.api.riotgames.com",
	TR: "europe.api.riotgames.com",
	RU: "europe.api.riotgames.com",
};

export class RiotAccountRepositoryImpl {

	async getByRiotId(gameName, tagLine, regionCode = 'EUW') {
		const platformRegion = regionCode.toUpperCase();
		const baseUrl = regionalRouting[platformRegion] || regionalRouting.EUW;

		const url = `https://${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
		const response = await fetch(url, {
			headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
		});
		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`Riot API error (account by Riot ID ${response.status}): ${errorBody}`);
			throw new Error(`Riot API error (account): ${response.status}`);
		}
		const data = await response.json();
		return {
			puuid: data.puuid,
			gameName: data.gameName,
			tagLine: data.tagLine
		};
	}

	/**
	 * Fetches account details (Riot ID: gameName, tagLine) by PUUID.
	 * This uses the /riot/account/v1/accounts/by-puuid endpoint.
	 * @param {string} puuid - The player's unique PUUID.
	 * @param {string} platformRegionCode - A platform region code (e.g., 'EUW', 'NA') to determine the regional routing.
	 * @returns {Promise<Object>} A promise that resolves to an object containing gameName and tagLine.
	 * @throws {Error} If the Riot API request fails or region mapping is missing.
	 */
	async getAccountByPUUID(puuid, platformRegionCode = 'EUW') {
		const regionKey = platformRegionCode.toUpperCase();
		const baseDomain = regionalRouting[regionKey];

		if (!baseDomain) {
			console.error(`No regional routing found for platformRegionCode: ${regionKey} in getAccountByPUUID. Check regionalRoutingMap.`);
			throw new Error(`Configuración regional inválida para obtener cuenta por PUUID: ${regionKey}`);
		}

		const url = `https://${baseDomain}/riot/account/v1/accounts/by-puuid/${puuid}`;
		const response = await fetch(url, {
			headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`Riot API error (account by PUUID ${response.status}): ${errorBody}`);
			throw new Error(`Error de API de Riot al obtener cuenta por PUUID: ${response.status}`);
		}
		const data = await response.json();
		return {
			gameName: data.gameName,
			tagLine: data.tagLine,
		};
	}

	async getDetailsByPUUID(puuid, region) {
		const platformBaseUrl = riotRegionMap[region.toUpperCase()];
		if (!platformBaseUrl) throw new Error(`Invalid region for PUUID details: ${region}`);

		const url = `https://${platformBaseUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
		const response = await fetch(url, {
			headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
		});
		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`Riot API error (summoner by PUUID ${response.status}): ${errorBody}`);
			throw new Error(`Riot API error (summoner): ${response.status}`);
		}
		const data = await response.json();
		return {
			summonerId: data.id,
			profileIconId: data.profileIconId,
			summonerLevel: data.summonerLevel,
			name: data.name
		};
	}

	async getRankBySummonerId(summonerId, region) {
		const platformBaseUrl = riotRegionMap[region.toUpperCase()];
		if (!platformBaseUrl) throw new Error(`Invalid region for rank: ${region}`);

		const url = `https://${platformBaseUrl}/lol/league/v4/entries/by-summoner/${summonerId}`;
		const response = await fetch(url, {
			headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
		});
		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`Riot API error (rank by summoner ID ${response.status}): ${errorBody}`);
			throw new Error(`Riot API error (rank): ${response.status}`);
		}
		const data = await response.json();
		return data.map(e =>
			new AccountRank({
				queueType: e.queueType,
				tier: e.tier,
				rank: e.rank,
				leaguePoints: e.leaguePoints,
				wins: e.wins,
				losses: e.losses,
				rankIconUrl: `/api/assets/ranked/${e.tier?.toLowerCase() ?? 'unranked'}.png`,
			})
		);
	}

	async getChampionMasteryTop(puuid, region, top = 4) {
		const platformBaseUrl = riotRegionMap[region.toUpperCase()];
		if (!platformBaseUrl) throw new Error(`Invalid region for champion mastery: ${region}`);

		const url = `https://${platformBaseUrl}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`;
		const response = await fetch(url, {
			headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
		});
		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`Riot API error (mastery by PUUID ${response.status}): ${errorBody}`);
			throw new Error(`Riot API error (mastery): ${response.status}`);
		}
		const data = await response.json();
		return data.slice(0, top).map(m =>
			new ChampionMastery({
				championId: m.championId,
				masteryPoints: m.championPoints
			})
		);
	}

	async getRecentMatchIds(puuid, region, matchCount = 10) {
		const regionalBaseUrl = regionalRouting[region.toUpperCase()];
		if (!regionalBaseUrl) throw new Error(`Invalid region for match IDs: ${region}`);

		const url = `https://${regionalBaseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${matchCount}`;
		const response = await fetch(url, {
			headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
		});
		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`Riot API error (match IDs by PUUID ${response.status}): ${errorBody}`);
			throw new Error(`Riot API error (match ids): ${response.status}`);
		}
		return await response.json();
	}

	async getMatchDetails(matchId, region) {
		const regionalBaseUrl = regionalRouting[region.toUpperCase()];
		if (!regionalBaseUrl) throw new Error(`Invalid region for match details: ${region}`);

		const url = `https://${regionalBaseUrl}/lol/match/v5/matches/${matchId}`;
		const response = await fetch(url, {
			headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
		});
		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`Riot API error (match details ${response.status}): ${errorBody}`);
			throw new Error(`Riot API error (match details): ${response.status}`);
		}
		return await response.json();
	}

	/**
	 * Fetches the Challenger league players for a given region and queue,
	 * enriching the top entries with their summoner names.
	 * @param {string} region - The platform routing value for the region (e.g., 'EUW', 'NA').
	 * @param {string} queue - The queue type (e.g., 'RANKED_SOLO_5x5').
	 * @param {number} [enrichCount=10] - Number of top players to enrich with summoner names.
	 * @returns {Promise<Array>} A promise that resolves to an array of enriched player entries.
	 */
	async getChallengerLeague(platformRegionCode, queue, enrichCount = 10) {
		const regionKey = platformRegionCode.toUpperCase();
		const platformDomain = riotRegionMap[regionKey];
		if (!platformDomain) {
			throw new Error(`Región de plataforma inválida para Liga Challenger: ${regionKey}`);
		}
		const leagueUrl = `https://${platformDomain}/lol/league/v4/challengerleagues/by-queue/${encodeURIComponent(queue)}`;
		const leagueResponse = await fetch(leagueUrl, {
			headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
		});
		if (!leagueResponse.ok) {
			const errorBody = await leagueResponse.text();
			console.error(`Riot API error (Liga Challenger ${leagueResponse.status}): ${errorBody}`);
			throw new Error(`Error de API de Riot (Liga Challenger): ${leagueResponse.status}`);
		}
		const leagueData = await leagueResponse.json();
		const entries = leagueData.entries || [];
		const topEntriesToEnrich = entries.slice(0, enrichCount);
		const enrichedEntries = [];

		for (const entry of topEntriesToEnrich) {
			let gameNameToStore = null;
			let tagLineToStore = null;
			let displayableRiotId = "Nombre#TAG no disponible";

			try {
				const accountDetails = await this.getAccountByPUUID(entry.puuid, platformRegionCode);

				if (accountDetails &&
					typeof accountDetails.gameName === 'string' && accountDetails.gameName.trim() !== '' &&
					typeof accountDetails.tagLine === 'string' && accountDetails.tagLine.trim() !== '') {

					gameNameToStore = accountDetails.gameName;
					tagLineToStore = accountDetails.tagLine;
					displayableRiotId = `${gameNameToStore}#${tagLineToStore}`;

				} else {
					console.warn(`gameName o tagLine vacío/indefinido de account-v1 para PUUID ${entry.puuid} (Región: ${platformRegionCode}). Detalles:`, accountDetails);
					if (accountDetails && typeof accountDetails.gameName === 'string' && accountDetails.gameName.trim() !== '') {
						gameNameToStore = accountDetails.gameName;
					}
				}
			} catch (error) {
				console.error(`Fallo al obtener Riot ID (account-v1) para PUUID ${entry.puuid} (Región: ${platformRegionCode}): ${error.message}`);
			}
			enrichedEntries.push({
				...entry,
				gameName: gameNameToStore,
				tagLine: tagLineToStore,
				riotIdForDisplay: displayableRiotId
			});
		}
		return enrichedEntries;
	}

}