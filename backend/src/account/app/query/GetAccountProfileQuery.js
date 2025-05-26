export class GetAccountProfileQuery {
	/**
	 * @param {string} gameName
	 * @param {string} tagLine
	 * @param {string} region
	 */
	constructor({gameName, tagLine, region}) {
		this.gameName = gameName;
		this.tagLine = tagLine;
		this.region = region;
	}
}