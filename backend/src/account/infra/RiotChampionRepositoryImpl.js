export class RiotChampionRepositoryImpl {
    constructor(championMap) {
        this.championMap = championMap;
    }

    async getChampionInfo(championId) {
        const champ = this.championMap[String(championId)];
        if (!champ) throw new Error('Champion not found');
        return champ;
    }
}