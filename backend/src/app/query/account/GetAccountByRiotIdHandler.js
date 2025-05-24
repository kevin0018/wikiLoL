export class GetAccountByRiotIdHandler {
    /**
     * @param {AccountRepository} accountRepository
     */
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * @param {GetAccountByRiotIdQuery} query
     * @returns {Promise<Account>}
     */
    async execute(query) {
        return await this.accountRepository.findByRiotId(query.gameName, query.tagLine);
    }
}