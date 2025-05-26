export class GetAccountRankHandler {
	constructor(accountRepository) {
		this.accountRepository = accountRepository;
	}

	async execute(query) {
		/**
		 * @param {GetAccountRankQuery} query
		 * @returns {Promise<AccountRank>}
		 */
		return await this.accountRepository.getRankBySummonerId(query.summonerId, query.region);
	}
}