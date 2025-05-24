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