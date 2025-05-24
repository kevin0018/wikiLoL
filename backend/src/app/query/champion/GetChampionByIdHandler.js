export class GetChampionByIdHandler {
    /**
     * @param {ChampionRepository} championRepository
     */
    constructor(championRepository) {
        this.championRepository = championRepository;
    }

    /**
     * @param {GetChampionByIdQuery} query
     * @returns {Promise<Champion>}
     */
    async execute(query) {
        return await this.championRepository.findById(query.id, query.lang, query.version);
    }
}