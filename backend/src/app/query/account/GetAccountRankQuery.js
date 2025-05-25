export class GetAccountRankQuery {
    /**
     * @param {string} puuid
     * @param {string} [region]
     */
    constructor(puuid, region) {
        this.puuid = puuid;
        this.region = region;
    }
}