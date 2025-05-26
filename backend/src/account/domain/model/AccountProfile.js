export class AccountProfile {
	/**
	 * @param {string} gameName
	 * @param {string} tagLine
	 * @param {string} puuid
	 * @param {string} summonerId
	 * @param {string} accountId
	 * @param {number} profileIconId
	 * @param {number} summonerLevel
	 * @param {string} region
	 */
	constructor({gameName, tagLine, puuid, summonerId, profileIconId, summonerLevel, region}) {
		this.gameName = gameName;
		this.tagLine = tagLine;
		this.puuid = puuid;
		this.summonerId = summonerId;
		this.profileIconId = profileIconId;
		this.summonerLevel = summonerLevel;
		this.region = region;
	}
}