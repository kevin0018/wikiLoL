export class AccountRepository {
    /**
     * @param {string} gameName
     * @param {string} tagLine
     * @returns {Promise<Account>}
     */
    async getByRiotId(gameName, tagLine) {throw new Error("Not implemented"); }
    /**
     * @param {string} puuid
     * @param {string} [region]
     * @returns {Promise<Account>}
     */
    async getDetailsByPUUID(puuid, region) { throw new Error("Not implemented"); }
    /**
     * @param {string} summonerId
     * @param {string} region
     * @returns {Promise<Account>}
     */
    async getRankByAccountId(summonerId, region) { throw new Error("Not implemented"); }
}