export class AccountRepository {
    /**
     * @param {string} gameName
     * @param {string} tagLine
     * @returns {Promise<Account>}
     */
    async getByRiotId(gameName, tagLine) {throw new Error("Not implemented"); }
    /**
     * @param {string} puuid
     * @returns {Promise<Account>}
     */
    async getDetailsByPUUID(puuid) { throw new Error("Not implemented"); }
    /**
     * @param {string} puuid
     * @returns {Promise<Account>}
     */
    async getRankByAccountId(summonerId) { throw new Error("Not implemented"); }
}