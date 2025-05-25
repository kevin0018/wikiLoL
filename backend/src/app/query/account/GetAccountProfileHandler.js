export class GetAccountProfileHandler {
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * @param {GetAccountProfileQuery} query
     * @returns {Promise<Object>}
     */
    async execute(query) {
        const account = await this.accountRepository.getByRiotId(query.gameName, query.tagLine);
        const details = await this.accountRepository.getDetailsByPUUID(account.puuid, query.region);

        return {
            puuid: account.puuid,
            gameName: account.gameName,
            tagLine: account.tagLine,
            region: query.region,
            summonerId: details.summonerId,
            accountId: details.accountId,
            profileIconId: details.profileIconId,
            summonerLevel: details.summonerLevel,
            name: details.name
        };
    }
}