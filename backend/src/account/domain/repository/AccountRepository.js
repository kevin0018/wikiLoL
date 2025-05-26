export class AccountRepository {
	/**
	 * Fetches account profile by Riot ID (game name and tag line).
	 * @param {string} gameName
	 * @param {string} tagLine
	 * @returns {Promise<void>}
	 */
	async getByRiotId(gameName, tagLine) {
		throw new Error('Not implemented.');
	}

	/**
	 * Fetches account details by PUUID.
	 * @param puuid
	 * @param region
	 * @returns {Promise<void>}
	 */
	async getDetailsByPUUID(puuid, region) {
		throw new Error('Not implemented.');
	}

	/**
	 * Fetches account details by summoner ID.
	 * @param {string} summonerId
	 * @param {string} region
	 * @returns {Promise<void>}
	 */
	async getRankBySummonerId(summonerId, region) {
		throw new Error('Not implemented.');
	}

	/**
	 * Fetches champion mastery for a specific PUUID.
	 * @param {string} puuid
	 * @param {string} region
	 * @param {number} top
	 * @returns {Promise<void>}
	 */
	async getChampionMasteryTop(puuid, region, top = 4) {
		throw new Error('Not implemented.');
	}

	/**
	 * Fetches recent match IDs for a specific PUUID.
	 * @param {string} puuid
	 * @param {string} region
	 * @param {number} matchCount
	 * @returns {Promise<void>}
	 */
	async getRecentMatchIds(puuid, region, matchCount = 10) {
		throw new Error('Not implemented.');
	}

	/**
	 * Fetches match details by match ID.
	 * @param {string} matchId
	 * @param {string} region
	 * @returns {Promise<void>}
	 */
	async getMatchDetails(matchId, region) {
		throw new Error('Not implemented.');
	}
}