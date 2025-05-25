export class Account {
    /**
     * @param {string} puuid
     * @param {string} gameName
     * @param {string} tagLine
     * @param {string} region
     */
    constructor({ puuid, gameName, tagLine , region = "europe" }) {
        this.puuid = puuid;
        this.gameName = gameName;
        this.tagLine = tagLine;
        this.region = region;
    }
}