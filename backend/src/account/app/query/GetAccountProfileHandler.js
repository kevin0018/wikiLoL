export class GetAccountProfileHandler {
	constructor(accountProfileService) {
		this.accountProfileService = accountProfileService;
	}

	async execute(query) {
		/**
		 * @param {GetAccountProfileQuery} query
		 * @returns {Promise<AccountProfile>}
		 */
		return await this.accountProfileService.getFullProfile({
			gameName: query.gameName,
			tagLine: query.tagLine,
			region: query.region
		});
	}
}