export class Account {
    /**
     * @param {string} puuid
     * @param {string} gameName
     * @param {string} tagLine
     */
    constructor({ puuid, gameName, tagLine }) {
        this.puuid = puuid;
        this.gameName = gameName;
        this.tagLine = tagLine;
    }
}