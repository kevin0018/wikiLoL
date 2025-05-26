export class RiotChampionRepositoryImpl {
	constructor(championStaticData) {
		this.championStaticData = championStaticData;
	}

	async getChampionInfo(championId) {
		const champ = this.championStaticData[championId];
		if (!champ) throw new Error('Champion not found');
		return champ;
	}
}