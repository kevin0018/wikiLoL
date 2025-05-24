import { AccountRank } from "../../../domain/AccountRank.js";

// Receives an AccountRepository (hexagonal port)
export class GetAccountRankHandler {
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }

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