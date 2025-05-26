export class MostPlayedChampion {
	/**
	 * @param {string} championId
	 * @param {string} championName
	 * @param {string} championImageUrl
	 * @param {number} gamesPlayed
	 */
	constructor({championId, championName, championImageUrl, gamesPlayed}) {
		this.championId = championId;
		this.championName = championName;
		this.championImageUrl = championImageUrl;
		this.gamesPlayed = gamesPlayed;
	}
}