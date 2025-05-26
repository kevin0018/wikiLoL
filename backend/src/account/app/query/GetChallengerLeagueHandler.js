/**
 * Handler for GetChallengerLeagueQuery.
 */
export class GetChallengerLeagueHandler {
    /**
     * @param {object} accountRepository - The repository to fetch league data.
     */
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
        if (!accountRepository || typeof accountRepository.getChallengerLeague !== 'function') {
            throw new Error("Account repository with getChallengerLeague method is required for GetChallengerLeagueHandler.");
        }
    }

    /**
     * Executes the query to get Challenger league players.
     * @param {GetChallengerLeagueQuery} query - The query object.
     * @returns {Promise<Array>} A promise that resolves to an array of player entries.
     */
    async execute(query) {
        return this.accountRepository.getChallengerLeague(query.region, query.queue);
    }
}