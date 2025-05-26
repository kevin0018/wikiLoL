export class GetAccountRankQuery {
	/**
	 * @param {string} summonerId
	 * @param {string} [region]
	 */
	constructor({summonerId, region}) {
		this.summonerId = summonerId;
		this.region = region;
	}
	
}