import { AccountRank } from "../../../domain/AccountRank.js";

// Receives an AccountRepository
export class GetAccountRankHandler {
    /**
     * @param {AccountRepository} accountRepository
     */
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * @typedef {Object} GetAccountRankQuery
     * @param query
     * @returns {Promise<{details: never, ranks: never}>}
     */
    async execute(query) {
        const { puuid, region } = query;
        const ranks = await this.accountRepository.getRankByAccountId(puuid, region);

        return {
            ranks
        };
    }
}