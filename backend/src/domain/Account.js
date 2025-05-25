export class Account {
    /**
     * @param {string} puuid
     * @param {string} gameName
     * @param {string} tagLine
     * @param {string} region
     * @param {number} iconId
     */
    constructor({ puuid, gameName, tagLine , region = "europe", iconId }) {
        this.puuid = puuid;
        this.gameName = gameName;
        this.tagLine = tagLine;
        this.region = region;
        this.iconId = iconId;
    }
}