export class GetChampionDataHandler {
    /**
     * @param {ChampionDataRepository} championDataRepository
     */
    constructor(championDataRepository) {
        this.championDataRepository = championDataRepository;
    }

    /**
     * @param {GetChampionDataQuery} query
     * @returns {Promise<Object>}
     */
    async execute(query) {
        const champions = await this.championDataRepository.fetchAll(query.locale, query.version);
        return { data: champions };
    }
}