import { AccountRank } from "../../../domain/AccountRank.js";

// Receives an AccountRepository (hexagonal port)
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
        const { puuid } = query;
        const details = await this.accountRepository.getDetailsByPUUID(puuid);
        const ranks = await this.accountRepository.getRankByAccountId(details.id);

        return {
            details,
            ranks
        };
    }
}