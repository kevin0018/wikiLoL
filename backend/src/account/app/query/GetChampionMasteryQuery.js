export class GetChampionMasteryQuery {
	/**
	 * @param {string} puuid - Player's unique identifier
	 * @param {string} region - The region of the player
	 * @param {number} [top] - The number of top champion masteries to retrieve, default is 4
	 */
	constructor({puuid, region, top}) {
		this.puuid = puuid;
		this.region = region;
		this.top = top ?? 4; // Default to 4 if not provided
	}
}