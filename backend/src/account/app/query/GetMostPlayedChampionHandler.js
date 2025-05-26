export class GetMostPlayedChampionHandler {
	constructor(accountRepository, championRepository) {
		this.accountRepository = accountRepository;
		this.championRepository = championRepository;
	}

	async execute(query) {
		// query: { puuid, region, matchCount, top }
		const matchIds = await this.accountRepository.getRecentMatchIds(query.puuid, query.region, query.matchCount);

		const championCount = {};
		for (const matchId of matchIds) {
			const match = await this.accountRepository.getMatchDetails(matchId, query.region);
			// Find participant for this PUUID
			const participant = match.info.participants.find(p => p.puuid === query.puuid);
			if (participant) {
				const champId = participant.championId;
				championCount[champId] = (championCount[champId] ?? 0) + 1;
			}
		}

		const sortedChampionIds = Object.keys(championCount)
			.sort((a, b) => championCount[b] - championCount[a])
			.slice(0, query.top);

		return await Promise.all(
			sortedChampionIds.map(async champId => {
				const staticData = await this.championRepository.getChampionInfo(Number(champId));
				return {
					championId: Number(champId),
					championName: staticData.name,
					championImageUrl: staticData.imageUrl,
					gamesPlayed: championCount[champId]
				};
			})
		);
	}
}