// ENGLISH COMMENTS ONLY!
import {AccountProfile} from '../domain/model/AccountProfile.js';
import {AccountRank} from '../domain/model/AccountRank.js';
import {ChampionMastery} from '../domain/model/ChampionMastery.js';

const riotRegionMap = {
	EUW: "euw1.proxy.riotgames.com",
	NA: "na1.proxy.riotgames.com",
	EUNE: "eun1.proxy.riotgames.com",
	LAN: "la1.proxy.riotgames.com",
	LAS: "la2.proxy.riotgames.com"
};

const regionalRouting = {
	EUW: "europe.api.riotgames.com",
	EUNE: "europe.api.riotgames.com",
	NA: "americas.api.riotgames.com",
	LAN: "americas.api.riotgames.com",
	LAS: "americas.api.riotgames.com"
};

export class RiotAccountRepositoryImpl {

	async getByRiotId(gameName, tagLine) {
		const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
		const response = await fetch(url, {
			headers: {"X-Riot-Token": process.env.RIOT_API_KEY}
		});
		if (!response.ok) throw new Error(`Riot API error (account): ${response.status}`);
		const data = await response.json();
		return {
			puuid: data.puuid,
			gameName: data.gameName,
			tagLine: data.tagLine
		};
	}

	async getDetailsByPUUID(puuid, region) {
		const url = `https://${riotRegionMap[region.toUpperCase()]}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
		const response = await fetch(url, {
			headers: {"X-Riot-Token": process.env.RIOT_API_KEY}
		});
		if (!response.ok) throw new Error(`Riot API error (summoner): ${response.status}`);
		const data = await response.json();
		return {
			summonerId: data.id,
			profileIconId: data.profileIconId,
			summonerLevel: data.summonerLevel,
			name: data.name
		};
	}

	async getRankBySummonerId(summonerId, region) {
		const url = `https://${riotRegionMap[region.toUpperCase()]}/lol/league/v4/entries/by-summoner/${summonerId}`;
		const response = await fetch(url, {
			headers: {"X-Riot-Token": process.env.RIOT_API_KEY}
		});
		if (!response.ok) {
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
		const url = `https://${riotRegionMap[region.toUpperCase()]}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`;
		const response = await fetch(url, {
			headers: {"X-Riot-Token": process.env.RIOT_API_KEY}
		});
		if (!response.ok) throw new Error(`Riot API error (mastery): ${response.status}`);
		const data = await response.json();
		return data.slice(0, top).map(m =>
			new ChampionMastery({
				championId: m.championId,
				masteryPoints: m.championPoints
			})
		);
	}

	async getRecentMatchIds(puuid, region, matchCount = 10) {
		const url = `https://${regionalRouting[region.toUpperCase()]}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${matchCount}`;
		const response = await fetch(url, {
			headers: {"X-Riot-Token": process.env.RIOT_API_KEY}
		});
		if (!response.ok) throw new Error(`Riot API error (match ids): ${response.status}`);
		return await response.json(); // Array of match IDs
	}

	async getMatchDetails(matchId, region) {
		const url = `https://${regionalRouting[region.toUpperCase()]}/lol/match/v5/matches/${matchId}`;
		const response = await fetch(url, {
			headers: {"X-Riot-Token": process.env.RIOT_API_KEY}
		});
		if (!response.ok) throw new Error(`Riot API error (match details): ${response.status}`);
		return await response.json();
	}
}