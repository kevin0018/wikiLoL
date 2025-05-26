export class GetChampionMasteryHandler {
	constructor(accountRepository, championRepository) {
		this.accountRepository = accountRepository;
		this.championRepository = championRepository;
	}

	/**
	 * Execute the query to get a champion mastery top list for a given account.
	 * @param query
	 * @returns {Promise<Awaited<unknown>[]>}
	 */
	async execute(query) {
		// query: { puuid, region, top }
		const masteryList = await this.accountRepository.getChampionMasteryTop(query.puuid, query.region, query.top);
		// Enrich with champion static data (name, image)
		return await Promise.all(
			masteryList.map(async mastery => {
				const staticData = await this.championRepository.getChampionInfo(mastery.championId);
				return {
					championId: mastery.championId,
					championName: staticData.name,
					championImageUrl: staticData.imageUrl,
					masteryPoints: mastery.masteryPoints
				};
			})
		);
	}
}