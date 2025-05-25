export class GetAccountByRiotIdQuery {
	/**
	 * @param {string} gameName
	 * @param {string} tagLine
	 */
	constructor(gameName, tagLine) {
		this.gameName = gameName;
		this.tagLine = tagLine;
	}
}


export class GetAccountProfileQuery extends GetAccountByRiotIdQuery {
	constructor(gameName, tagLine, region) {
		super(gameName, tagLine);
		this.region = region;
	}
}