export class ChampionMastery {
	/**
	 * @param {string} championId
	 * @param {string} championName
	 * @param {string} championImageUrl
	 * @param {number} masteryPoints
	 */
	constructor({championId, championName, championImageUrl, masteryPoints}) {
		this.championId = championId;
		this.championName = championName;
		this.championImageUrl = championImageUrl;
		this.masteryPoints = masteryPoints;
	}
}