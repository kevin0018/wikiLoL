export class AccountRank {
	/**
	 * @typedef {Object} AccountRank
	 * @property {string} queueType - The type of the queue (e.g., "RANKED_SOLO_5x5").
	 * @property {string} tier - The tier of the rank (e.g., "GOLD").
	 * @property {string} rank - The rank within the tier (e.g., "IV").
	 * @property {number} leaguePoints - The number of league points.
	 * @property {number} wins - The number of wins.
	 * @property {number} losses - The number of losses.
	 * @property {string} rankIconUrl - URL to the rank icon image.
	 */
	constructor({queueType, tier, rank, leaguePoints, wins, losses, rankIconUrl}) {
		this.queueType = queueType;
		this.tier = tier;
		this.rank = rank;
		this.leaguePoints = leaguePoints;
		this.wins = wins;
		this.losses = losses;
		this.rankIconUrl = rankIconUrl;
	}
}